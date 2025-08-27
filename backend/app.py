from flask import Flask, request, jsonify, send_from_directory, url_for
from flask_cors import CORS
import os
from datetime import datetime
from memory_processor.audio_transcriber import transcribe_audio
from memory_processor.frame_extractor import extract_keyframes
from memory_processor.memory_store import save_memory, search_memory, get_all_memories, delete_memory
import threading

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
FRAMES_FOLDER = os.path.join(BASE_DIR, 'frames')
PROCESSING_STATUS = {}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(FRAMES_FOLDER, exist_ok=True)

def process_memory_async(filepath, filename):
    """Process memory in background thread"""
    try:
        PROCESSING_STATUS[filename] = {"status": "processing", "progress": 30, "message": "Transcribing audio..."}
        
        # Transcribe (auto-detect language + translate to English)
        transcript = transcribe_audio(filepath)
        PROCESSING_STATUS[filename] = {"status": "processing", "progress": 60, "message": "Extracting keyframes..."}
        
        # Extract keyframes
        keyframes = extract_keyframes(filepath)
        frame_filenames = [os.path.basename(frame) for frame in keyframes]
        PROCESSING_STATUS[filename] = {"status": "processing", "progress": 80, "message": "Saving to database..."}

        # Save memory (transcript is already in English)
        memory_id = save_memory(filepath, transcript, frame_filenames)
        
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

@app.route('/upload', methods=['POST'])
def upload_memory():
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
    filename = f"{timestamp}_{file.filename}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    
    # Start processing in background thread
    thread = threading.Thread(target=process_memory_async, args=(filepath, filename))
    thread.start()
    
    PROCESSING_STATUS[filename] = {"status": "queued", "progress": 10, "message": "File uploaded, starting processing..."}
    
    return jsonify({
        'message': 'Memory upload started', 
        'filename': filename,
        'status_url': url_for('processing_status', filename=filename, _external=True)
    })

@app.route('/processing-status/<filename>')
def processing_status(filename):
    status = PROCESSING_STATUS.get(filename, {"status": "unknown", "progress": 0, "message": "No status available"})
    return jsonify(status)

@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('query')
    if not query or len(query.strip()) < 2:
        return jsonify({'error': 'Search query must be at least 2 characters long'}), 400
        
    results = search_memory(query)

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
def get_memories():
    memories = get_all_memories()

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
def delete(memory_id):
    deleted_count = delete_memory(memory_id)

    if deleted_count > 0:
        return jsonify({'message': 'Memory deleted successfully'})
    else:
        return jsonify({'error': 'Memory not found'}), 404

@app.route('/frames/<filename>')
def serve_frame(filename):
    return send_from_directory(FRAMES_FOLDER, filename)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    app.run(debug=True, port=5000)