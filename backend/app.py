from flask import Flask, request, jsonify, send_from_directory, url_for
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import os
from datetime import datetime, timedelta
from memory_processor.audio_transcriber import transcribe_audio
from memory_processor.frame_extractor import extract_keyframes
from memory_processor.memory_store import save_memory, search_memory, get_all_memories, delete_memory, get_user_memories
from memory_processor.summarizer import summarize_content
from auth.user_manager import register_user, login_user, get_user_by_id
import threading
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'fallback-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['MONGO_URI'] = os.environ.get('MONGO_ATLAS_URI', 'mongodb://localhost:27017/')

# Initialize extensions
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
FRAMES_FOLDER = os.path.join(BASE_DIR, 'frames')
PROCESSING_STATUS = {}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(FRAMES_FOLDER, exist_ok=True)

def process_memory_async(filepath, filename, user_id):
    """Process memory in background thread"""
    try:
        PROCESSING_STATUS[filename] = {"status": "processing", "progress": 30, "message": "Transcribing audio..."}
        
        # Transcribe (auto-detect language + translate to English)
        transcript = transcribe_audio(filepath)
        PROCESSING_STATUS[filename] = {"status": "processing", "progress": 50, "message": "Summarizing content..."}
        
        # Generate summary using OpenAI
        summary = summarize_content(transcript)
        
        PROCESSING_STATUS[filename] = {"status": "processing", "progress": 60, "message": "Extracting keyframes..."}
        
        # Extract keyframes
        keyframes = extract_keyframes(filepath)
        frame_filenames = [os.path.basename(frame) for frame in keyframes]
        PROCESSING_STATUS[filename] = {"status": "processing", "progress": 80, "message": "Saving to database..."}

        # Save memory with user_id
        memory_id = save_memory(filepath, transcript, summary, frame_filenames, user_id)
        
        PROCESSING_STATUS[filename] = {
            "status": "completed", 
            "progress": 100, 
            "message": "Memory processed successfully",
            "memory_id": str(memory_id)
        }
        
    except Exception as e:
        PROCESSING_STATUS[filename] = {
            "status": "error", 
            "progress": 100, 
            "message": f"Processing failed: {str(e)}"
        }

# Auth Routes
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        result = register_user(email, password, name)
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 400
        
        # Create access token
        access_token = create_access_token(identity=result['user_id'])
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user_id': result['user_id'],
            'email': email,
            'name': name
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Registration failed: ' + str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        result = login_user(email, password)
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 401
        
        # Create access token
        access_token = create_access_token(identity=result['user_id'])
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user_id': result['user_id'],
            'email': email,
            'name': result['name']
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Login failed: ' + str(e)}), 500

@app.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = get_user_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user_id': str(user['_id']),
            'email': user['email'],
            'name': user.get('name', ''),
            'created_at': user.get('created_at', '')
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch profile: ' + str(e)}), 500

# Protected Routes
@app.route('/upload', methods=['POST'])
@jwt_required()
def upload_memory():
    user_id = get_jwt_identity()
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
        
    # Validate file type
    allowed_extensions = {'mp3', 'wav', 'mp4', 'mov', 'avi', 'mkv'}
    if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({'error': 'Invalid file type. Please upload audio or video files.'}), 400
    
    # Save file with timestamp to avoid name conflicts
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{user_id}_{timestamp}_{file.filename}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    
    # Start processing in background thread
    thread = threading.Thread(target=process_memory_async, args=(filepath, filename, user_id))
    thread.start()
    
    PROCESSING_STATUS[filename] = {"status": "queued", "progress": 10, "message": "File uploaded, starting processing..."}
    
    return jsonify({
        'message': 'Memory upload started', 
        'filename': filename,
        'status_url': url_for('processing_status', filename=filename, _external=True)
    })

@app.route('/processing-status/<filename>')
@jwt_required()
def processing_status(filename):
    user_id = get_jwt_identity()
    # Verify the file belongs to the user
    if not filename.startswith(user_id + '_'):
        return jsonify({'error': 'Access denied'}), 403
    
    status = PROCESSING_STATUS.get(filename, {"status": "unknown", "progress": 0, "message": "No status available"})
    return jsonify(status)

@app.route('/search', methods=['GET'])
@jwt_required()
def search():
    user_id = get_jwt_identity()
    query = request.args.get('query')
    if not query or len(query.strip()) < 2:
        return jsonify({'error': 'Search query must be at least 2 characters long'}), 400
        
    results = search_memory(query, user_id)

    for memory in results:
        memory['keyframes'] = [
            url_for('serve_frame', filename=frame, _external=True)
            for frame in memory['keyframes']
        ]
        # Format date for frontend
        if 'upload_date' in memory:
            memory['upload_date'] = memory['upload_date'].strftime('%Y-%m-%d %H:%M')

    return jsonify(results)

@app.route('/memories', methods=['GET'])
@jwt_required()
def get_memories():
    user_id = get_jwt_identity()
    memories = get_user_memories(user_id)

    for memory in memories:
        memory['keyframes'] = [
            url_for('serve_frame', filename=frame, _external=True)
            for frame in memory['keyframes']
        ]
        # Format date for frontend
        if 'upload_date' in memory:
            memory['upload_date'] = memory['upload_date'].strftime('%Y-%m-%d %H:%M')

    return jsonify(memories)

@app.route('/delete/<memory_id>', methods=['DELETE'])
@jwt_required()
def delete(memory_id):
    user_id = get_jwt_identity()
    deleted_count = delete_memory(memory_id, user_id)

    if deleted_count > 0:
        return jsonify({'message': 'Memory deleted successfully'})
    else:
        return jsonify({'error': 'Memory not found or access denied'}), 404

@app.route('/frames/<filename>')
def serve_frame(filename):
    return send_from_directory(FRAMES_FOLDER, filename)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    app.run(debug=True, port=5000)