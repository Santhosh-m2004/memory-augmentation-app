import os
import requests
import json

# Get OpenAI API key from environment variable
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

def summarize_content(transcript, max_length=150):
    """
    Generate a summary of the transcript using OpenAI's API
    """
    if not OPENAI_API_KEY:
        return "Summary not available (OpenAI API key not configured)"
    
    if not transcript or transcript == "Audio is too silent, please provide clearer audio.":
        return "No transcript available for summarization"
    
    # Prepare the prompt
    prompt = f"Please provide a concise summary of the following content in {max_length} words or less:\n\n{transcript}"
    
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}"
        }
        
        data = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant that creates concise summaries of audio/video content."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": max_length * 2,  # Allow some extra tokens
            "temperature": 0.3  # Lower temperature for more focused summaries
        }
        
        response = requests.post(OPENAI_API_URL, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        summary = result['choices'][0]['message']['content'].strip()
        
        return summary
        
    except requests.exceptions.RequestException as e:
        print(f"OpenAI API request failed: {e}")
        return "Summary unavailable due to API error"
    except (KeyError, IndexError) as e:
        print(f"Failed to parse OpenAI response: {e}")
        return "Summary unavailable due to parsing error"
    except Exception as e:
        print(f"Unexpected error during summarization: {e}")
        return "Summary unavailable due to unexpected error"

# Fallback summarization if OpenAI is not available
def fallback_summarize(transcript, max_sentences=3):
    """
    Simple fallback summarization when OpenAI API is not available
    """
    if not transcript:
        return "No transcript available for summarization"
    
    # Simple algorithm: take the first few sentences
    sentences = transcript.split('. ')
    summary = '. '.join(sentences[:max_sentences])
    
    if len(sentences) > max_sentences:
        summary += "..."
    
    return summary