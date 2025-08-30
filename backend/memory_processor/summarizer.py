import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load .env file
load_dotenv()

# Get Gemini API key from environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("Gemini API key not found. Please set GEMINI_API_KEY in .env")

def summarize_content(transcript, max_length=150):
    """
    Generate a summary of the transcript using Google Gemini API
    """
    if not GEMINI_API_KEY:
        return "Summary not available (Gemini API key not configured)"
    
    if not transcript or transcript.strip() == "" or transcript == "Audio is too silent, please provide clearer audio.":
        return "No transcript available for summarization"
    
    try:
        # Initialize Gemini model (fast and cost-efficient)
        model = genai.GenerativeModel("gemini-1.5-flash")

        # Create the summarization prompt
        prompt = f"Please provide a concise summary of the following content in {max_length} words or less:\n\n{transcript}"

        # Call Gemini API
        response = model.generate_content(prompt)

        if hasattr(response, "text") and response.text:
            return response.text.strip()
        else:
            return "Summary unavailable (empty response)"
    
    except Exception as e:
        print(f"Gemini API request failed: {e}")
        return "Summary unavailable due to API error"

# Fallback summarization if Gemini is not available
def fallback_summarize(transcript, max_sentences=3):
    """
    Simple fallback summarization when Gemini API is not available
    """
    if not transcript:
        return "No transcript available for summarization"
    
    # Simple algorithm: take the first few sentences
    sentences = transcript.split('. ')
    summary = '. '.join(sentences[:max_sentences])
    
    if len(sentences) > max_sentences:
        summary += "..."
    
    return summary
