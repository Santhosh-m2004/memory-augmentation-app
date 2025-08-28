from pymongo import MongoClient
from bson import ObjectId
from googletrans import Translator
from datetime import datetime
import os

# Database setup
client = MongoClient('mongodb://localhost:27017/')
db = client['memory_db']
collection = db['memories']

# Create indexes for better search performance
collection.create_index([("transcript", "text"), ("translated_transcript", "text")])
collection.create_index("upload_date")

# Translator setup
translator = Translator()

def save_memory(filepath, transcript, summary, keyframes):
    """
    Save a memory into the database.
    Automatically translates transcript into English and stores both original and translated versions.
    """
    # Ensure transcript is string
    transcript = str(transcript)

    # Translate transcript to English (fallback if translation fails)
    try:
        translation = translator.translate(transcript, dest='en')
        translated_transcript = translation.text
        detected_language = translation.src
    except Exception as e:
        print(f"[Memory Store] Translation failed: {e}")
        translated_transcript = transcript
        detected_language = "unknown"

    # Extract filename for display
    filename = os.path.basename(filepath)
    
    memory = {
        "filename": filename,
        "filepath": filepath,
        "transcript": transcript,
        "summary": summary,
        "translated_transcript": translated_transcript,
        "detected_language": detected_language,
        "keyframes": keyframes,
        "upload_date": datetime.now(),
        "duration": len(transcript.split()) // 3  # Approximate duration in seconds (3 words per second)
    }

    result = collection.insert_one(memory)

    print(f"[Memory Store] Memory saved with ID: {result.inserted_id}")
    return result.inserted_id

def search_memory(query):
    """
    Search for memories by matching query with original and translated transcripts.
    Supports text search and returns results by relevance.
    """
    # Use MongoDB text search if available
    try:
        results = collection.find(
            {"$text": {"$search": query}},
            {"score": {"$meta": "textScore"}}
        ).sort([("score", {"$meta": "textScore"})])
    except:
        # Fallback to regex search if text index isn't available
        results = collection.find({
            "$or": [
                {"transcript": {"$regex": query, "$options": "i"}},
                {"translated_transcript": {"$regex": query, "$options": "i"}},
                {"summary": {"$regex": query, "$options": "i"}}
            ]
        }).sort("upload_date", -1)

    memories = []
    for memory in results:
        memory['_id'] = str(memory['_id'])
        # Calculate relevance score for display
        if 'score' not in memory:
            # Simple relevance calculation based on query occurrence
            text = f"{memory.get('transcript', '')} {memory.get('translated_transcript', '')} {memory.get('summary', '')}"
            memory['relevance'] = text.lower().count(query.lower()) / len(text) * 100 if text else 0
        memories.append(memory)

    print(f"[Memory Store] Found {len(memories)} memories matching query: '{query}'")
    return memories

def get_all_memories():
    """
    Fetch all memories from the database, sorted by date.
    """
    memories = []
    for memory in collection.find().sort("upload_date", -1):
        memory['_id'] = str(memory['_id'])
        memories.append(memory)

    print(f"[Memory Store] Retrieved {len(memories)} total memories.")
    return memories

def delete_memory(memory_id):
    """
    Delete memory by its unique ID.
    """
    try:
        # Get memory first to remove associated files
        memory = collection.find_one({"_id": ObjectId(memory_id)})
        if memory:
            # Remove the file from uploads
            if os.path.exists(memory['filepath']):
                os.remove(memory['filepath'])
            
            # Remove keyframes
            for frame in memory.get('keyframes', []):
                frame_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frames', frame)
                if os.path.exists(frame_path):
                    os.remove(frame_path)
        
        result = collection.delete_one({"_id": ObjectId(memory_id)})
        if result.deleted_count > 0:
            print(f"[Memory Store] Memory {memory_id} deleted successfully.")
        else:
            print(f"[Memory Store] Memory {memory_id} not found.")
        return result.deleted_count
    except Exception as e:
        print(f"[Memory Store] Error deleting memory {memory_id}: {e}")
        return 0

def get_memory_stats():
    """
    Get statistics about stored memories.
    """
    total_memories = collection.count_documents({})
    total_duration = collection.aggregate([{
        "$group": {
            "_id": None,
            "total_duration": {"$sum": "$duration"}
        }
    }])
    
    total_duration = list(total_duration)
    total_duration = total_duration[0]['total_duration'] if total_duration else 0
    
    # Count by language
    language_stats = collection.aggregate([{
        "$group": {
            "_id": "$detected_language",
            "count": {"$sum": 1}
        }
    }])
    
    return {
        "total_memories": total_memories,
        "total_duration": total_duration,
        "language_stats": list(language_stats)
    }