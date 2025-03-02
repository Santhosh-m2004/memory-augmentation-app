from pymongo import MongoClient
from bson import ObjectId
from googletrans import Translator

# Database setup
client = MongoClient('mongodb://localhost:27017/')
db = client['memory_db']
collection = db['memories']

# Translator setup
translator = Translator()

def save_memory(filepath, transcript, keyframes):
    """
    Save a memory into the database.
    Automatically translates transcript into English and stores both original and translated versions.
    """
    # Ensure transcript is string (sometimes NLTK or Whisper might return non-string)
    transcript = str(transcript)

    # Translate transcript to English (fallback if translation fails)
    try:
        translation = translator.translate(transcript, dest='en')
        translated_transcript = translation.text
        detected_language = translation.src
    except Exception as e:
        print(f"[Memory Store] Translation failed: {e}")
        translated_transcript = transcript  # Fallback if translation fails
        detected_language = "unknown"

    memory = {
        "filepath": filepath,
        "transcript": transcript,
        "translated_transcript": translated_transcript,
        "detected_language": detected_language,
        "keyframes": keyframes
    }

    result = collection.insert_one(memory)

    print(f"[Memory Store] Memory saved with ID: {result.inserted_id}")
    return result.inserted_id

def search_memory(query):
    """
    Search for memories by matching query with original and translated transcripts.
    """
    results = collection.find({
        "$or": [
            {"transcript": {"$regex": query, "$options": "i"}},
            {"translated_transcript": {"$regex": query, "$options": "i"}}
        ]
    })

    memories = []
    for memory in results:
        memory['_id'] = str(memory['_id'])
        memories.append(memory)

    print(f"[Memory Store] Found {len(memories)} memories matching query: '{query}'")
    return memories

def get_all_memories():
    """
    Fetch all memories from the database.
    """
    memories = []
    for memory in collection.find():
        memory['_id'] = str(memory['_id'])
        memories.append(memory)

    print(f"[Memory Store] Retrieved {len(memories)} total memories.")
    return memories

def delete_memory(memory_id):
    """
    Delete memory by its unique ID.
    """
    try:
        result = collection.delete_one({"_id": ObjectId(memory_id)})
        if result.deleted_count > 0:
            print(f"[Memory Store] Memory {memory_id} deleted successfully.")
        else:
            print(f"[Memory Store] Memory {memory_id} not found.")
        return result.deleted_count
    except Exception as e:
        print(f"[Memory Store] Error deleting memory {memory_id}: {e}")
        return 0
