from pymongo import MongoClient
from bson import ObjectId
from googletrans import Translator
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB Atlas connection
client = MongoClient(os.environ.get('MONGO_ATLAS_URI', 'mongodb://localhost:27017/'))
db = client['memory_db']
collection = db['memories']

# Create indexes for better search performance
collection.create_index([("user_id", 1), ("upload_date", -1)])
collection.create_index([("user_id", 1), ("transcript", "text"), ("translated_transcript", "text")])

# Translator setup
translator = Translator()

def save_memory(filepath, transcript, summary, keyframes, user_id):
    """
    Save a memory into the database with user association.
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
        "user_id": user_id,
        "upload_date": datetime.now(),
        "duration": len(transcript.split()) // 3  # Approximate duration in seconds (3 words per second)
    }

    result = collection.insert_one(memory)
    print(f"[Memory Store] Memory saved with ID: {result.inserted_id} for user: {user_id}")
    return result.inserted_id

def search_memory(query, user_id):
    """
    Search for memories by matching query with user's content only.
    """
    try:
        # Use MongoDB text search with user filter
        results = collection.find(
            {
                "user_id": user_id,
                "$text": {"$search": query}
            },
            {"score": {"$meta": "textScore"}}
        ).sort([("score", {"$meta": "textScore"})])
    except:
        # Fallback to regex search with user filter
        results = collection.find({
            "user_id": user_id,
            "$or": [
                {"transcript": {"$regex": query, "$options": "i"}},
                {"translated_transcript": {"$regex": query, "$options": "i"}},
                {"summary": {"$regex": query, "$options": "i"}}
            ]
        }).sort("upload_date", -1)

    memories = []
    for memory in results:
        memory['_id'] = str(memory['_id'])
        memories.append(memory)

    print(f"[Memory Store] Found {len(memories)} memories for user {user_id} matching query: '{query}'")
    return memories

def get_user_memories(user_id):
    """
    Fetch all memories for a specific user, sorted by date.
    """
    memories = []
    for memory in collection.find({"user_id": user_id}).sort("upload_date", -1):
        memory['_id'] = str(memory['_id'])
        memories.append(memory)

    print(f"[Memory Store] Retrieved {len(memories)} memories for user: {user_id}")
    return memories

def get_all_memories():
    """
    Fetch all memories (admin function - use with caution)
    """
    memories = []
    for memory in collection.find().sort("upload_date", -1):
        memory['_id'] = str(memory['_id'])
        memories.append(memory)

    print(f"[Memory Store] Retrieved {len(memories)} total memories.")
    return memories

def delete_memory(memory_id, user_id):
    """
    Delete memory by its unique ID, only if it belongs to the user.
    """
    try:
        # Get memory first to verify ownership and remove associated files
        memory = collection.find_one({"_id": ObjectId(memory_id), "user_id": user_id})
        if memory:
            # Remove the file from uploads
            if os.path.exists(memory['filepath']):
                os.remove(memory['filepath'])
            
            # Remove keyframes
            for frame in memory.get('keyframes', []):
                frame_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frames', frame)
                if os.path.exists(frame_path):
                    os.remove(frame_path)
        
        result = collection.delete_one({"_id": ObjectId(memory_id), "user_id": user_id})
        if result.deleted_count > 0:
            print(f"[Memory Store] Memory {memory_id} deleted successfully by user {user_id}.")
        else:
            print(f"[Memory Store] Memory {memory_id} not found or access denied for user {user_id}.")
        return result.deleted_count
    except Exception as e:
        print(f"[Memory Store] Error deleting memory {memory_id}: {e}")
        return 0

def get_memory_stats(user_id):
    """
    Get statistics about user's stored memories.
    """
    total_memories = collection.count_documents({"user_id": user_id})
    total_duration = collection.aggregate([
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": None,
            "total_duration": {"$sum": "$duration"}
        }}
    ])
    
    total_duration = list(total_duration)
    total_duration = total_duration[0]['total_duration'] if total_duration else 0
    
    # Count by language for this user
    language_stats = collection.aggregate([
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": "$detected_language",
            "count": {"$sum": 1}
        }}
    ])
    
    return {
        "total_memories": total_memories,
        "total_duration": total_duration,
        "language_stats": list(language_stats)
    }