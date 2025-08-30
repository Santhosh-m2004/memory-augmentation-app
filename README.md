# AI Memory Augmentation App

## Description

AI Memory Augmentation is a full-stack project designed to help users upload and manage their audio or video memories. Once uploaded, the system automatically:

- Transcribes speech using **OpenAI Whisper** (including language detection and translation to English).
- Extracts keyframes from videos using **OpenCV**.
- Stores the transcripts and frames in a **MongoDB** database.
- Gives a summary of the audio (transcript) using AI models, including emotional analysis.
- Allows users to **search, view, and delete** memories via a simple web interface.

This project combines **React** (Frontend) with **Flask** (Backend) and uses multiple AI tools for processing.

---
## Tech Stack

### Frontend

- React (Vite/CRA)

### Backend

- Flask (Python)

### Database

- MongoDB


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
## Author

**Santhosh M**\


