import cv2
import os
import uuid

# Set absolute path for frames folder to avoid relative path issues
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # This points to 'memory_processor'
FRAMES_FOLDER = os.path.join(BASE_DIR, '..', 'frames')

# Ensure frames folder exists
os.makedirs(FRAMES_FOLDER, exist_ok=True)

def extract_keyframes(video_path):
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print(f"[Frame Extractor] Error: Unable to open video file: {video_path}")
        return []

    count = 0
    keyframes = []

    # Generate unique prefix to avoid frame name conflicts across uploads
    unique_prefix = str(uuid.uuid4())[:8]  # Short UUID (8 chars)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if count % 30 == 0:  # Save every 30th frame (adjustable)
            frame_filename = f'{unique_prefix}_frame_{count}.jpg'
            frame_path = os.path.join(FRAMES_FOLDER, frame_filename)
            cv2.imwrite(frame_path, frame)
            keyframes.append(frame_filename)  # Only filename (no full path)

        count += 1

    cap.release()

    print(f"[Frame Extractor] Extracted {len(keyframes)} keyframes from {video_path}")
    return keyframes  # List of filenames like ['abcd1234_frame_0.jpg', 'abcd1234_frame_30.jpg']
