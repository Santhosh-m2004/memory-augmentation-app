import whisper
import librosa

# Load Whisper model once (global model load, not inside function)
model = whisper.load_model("medium")

def is_audio_silent(filepath, threshold=-40):
    """
    Checks if the audio file is silent or too quiet to process.
    Uses RMS amplitude to calculate loudness.
    """
    try:
        y, sr = librosa.load(filepath, sr=None)
        rms = librosa.feature.rms(y=y)[0]
        max_rms_db = librosa.amplitude_to_db([max(rms)])[0]

        print(f"[Audio Check] Max RMS (dB): {max_rms_db}")
        return max_rms_db < threshold
    except Exception as e:
        print(f"[Audio Check] Error checking silence: {e}")
        return False  # Assume not silent if check fails

def transcribe_audio(filepath):
    """
    Transcribes audio to English, automatically detecting language and translating.
    """
    if is_audio_silent(filepath):
        return "Audio is too silent, please provide clearer audio."

    try:
        # Transcribe with Whisper (auto-detect language + translate to English)
        result = model.transcribe(filepath, task="translate")

        english_transcript = result.get('text', '').strip()
        detected_language = result.get('language', 'unknown')

        print(f"[Transcriber] Detected Language: {detected_language}")
        print(f"[Transcriber] Transcription (English): {english_transcript}")

        if not english_transcript:
            return "No speech detected in the audio."

        return english_transcript

    except Exception as e:
        print(f"[Transcriber] Transcription failed: {e}")
        return f"Transcription failed: {str(e)}"
