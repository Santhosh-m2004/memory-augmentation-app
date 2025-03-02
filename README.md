# AI Memory Augmentation App

## Description

AI Memory Augmentation is a full-stack project designed to help users upload and manage their audio or video memories. Once uploaded, the system automatically:

- Transcribes speech using **OpenAI Whisper** (including language detection and translation to English).
- Extracts keyframes from videos using **OpenCV**.
- Stores the transcripts and frames in a **MongoDB** database.
- Allows users to **search, view, and delete** memories via a simple web interface.

This project combines **React** (Frontend) with **Flask** (Backend) and uses multiple AI tools for processing.

---

## Features

- Upload audio/video files.
- Automatic transcription using **Whisper AI**.
- Automatic language detection and translation to English.
- Extract important keyframes from videos.
- Save all data to **MongoDB**.
- Search memories using keywords.
- View all memories with their transcriptions and frames.
- Delete memories.
- Full-stack application with **React + Flask**.

---

## Tech Stack

### Frontend

- React (Vite/CRA)

### Backend

- Flask (Python)

### Database

- MongoDB

### AI Processing

- Transcription: OpenAI Whisper
- Translation: Google Translate API
- Video Processing: OpenCV
- Audio Analysis: Librosa

---

## Folder Structure

```
memory-augmentation-app/
├── backend/
│   ├── app.py                   # Flask API server
│   ├── memory_processor/
│   │   ├── audio_transcriber.py  # Transcription logic
│   │   ├── frame_extractor.py    # Keyframe extraction logic
│   │   ├── memory_store.py       # MongoDB interaction
│
├── frontend/
│   ├── src/
│   │   ├── App.js                 # Main app file
│   │   ├── api.js                  # API calls to backend
│   │   ├── MemoryUploader.js       # Upload component
│   │   ├── MemorySearch.js         # Search and display component
│
├── uploads/ (ignored in .gitignore)
├── frames/ (ignored in .gitignore)
├── .gitignore
├── README.md (this file)
```

---

## Installation & Setup

### 1. Backend Setup

- Navigate to backend folder:

```bash
cd backend
```

- Install dependencies:

```bash
pip install -r requirements.txt
```

- Start Flask server:

```bash
python app.py
```

### 2. Frontend Setup

- Navigate to frontend folder:

```bash
cd frontend
```

- Install dependencies:

```bash
npm install
```

- Start React app:

```bash
npm start
```

---

## Prerequisites

- Python 3.x
- Node.js
- MongoDB running locally (on port 27017)
- OpenAI Whisper model downloaded (`medium` model recommended)

---

## API Endpoints

| Method | Endpoint              | Description                                    |
| ------ | --------------------- | ---------------------------------------------- |
| POST   | /upload               | Uploads a file (audio/video) and processes it. |
| GET    | /search?query=...     | Searches memories by transcript content.       |
| GET    | /memories             | Retrieves all memories.                        |
| DELETE | /delete/\<memory\_id> | Deletes a specific memory.                     |

---

## Author

**Santhosh M**\


