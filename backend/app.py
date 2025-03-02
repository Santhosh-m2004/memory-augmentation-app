from flask import Flask, request, jsonify, send_from_directory, url_for
from flask_cors import CORS
import os
from memory_processor.audio_transcriber import transcribe_audio
from memory_processor.frame_extractor import extract_keyframes
from memory_processor.memory_store import save_memory, search_memory, get_all_memories, delete_memory

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
FRAMES_FOLDER = os.path.join(BASE_DIR, 'frames')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(FRAMES_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_memory():
    file = request.files['file']
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    # Transcribe (auto-detect language + translate to English)
    transcript = transcribe_audio(filepath)
    
    print(f"[UPLOAD] Transcribed Text (English): {transcript}")

    # Extract keyframes
    keyframes = extract_keyframes(filepath)
    frame_filenames = [os.path.basename(frame) for frame in keyframes]

    # Save memory (transcript is already in English)
    memory_id = save_memory(filepath, transcript, frame_filenames)

    return jsonify({'message': 'Memory Uploaded', 'memory_id': str(memory_id)})

@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('query')
    results = search_memory(query)

    for memory in results:
        memory['keyframes'] = [
            url_for('serve_frame', filename=frame, _external=True)
            for frame in memory['keyframes']
        ]

    return jsonify(results)

@app.route('/memories', methods=['GET'])
def get_memories():
    memories = get_all_memories()

    for memory in memories:
        memory['keyframes'] = [
            url_for('serve_frame', filename=frame, _external=True)
            for frame in memory['keyframes']
        ]

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
