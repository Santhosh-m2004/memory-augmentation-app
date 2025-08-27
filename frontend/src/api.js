const BASE_URL = 'http://localhost:5000';

export const uploadMemory = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
    }
    
    return await response.json();
};

export const getProcessingStatus = async (filename) => {
    const response = await fetch(`${BASE_URL}/processing-status/${filename}`);
    return await response.json();
};

export const searchMemory = async (query) => {
    const response = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Search failed');
    }
    
    return await response.json();
};

export const getAllMemories = async () => {
    const response = await fetch(`${BASE_URL}/memories`);
    return await response.json();
};

export const deleteMemory = async (id) => {
    const response = await fetch(`${BASE_URL}/delete/${id}`, { 
        method: 'DELETE' 
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
    }
    
    return await response.json();
};

export const getHealthStatus = async () => {
    const response = await fetch(`${BASE_URL}/health`);
    return await response.json();
};

export const getMemoryStats = async () => {
    // This would need a corresponding endpoint in the backend
    // For now, we'll calculate from all memories
    const memories = await getAllMemories();
    
    const totalDuration = memories.reduce((sum, memory) => sum + (memory.duration || 0), 0);
    const languageCount = {};
    
    memories.forEach(memory => {
        const lang = memory.detected_language || 'unknown';
        languageCount[lang] = (languageCount[lang] || 0) + 1;
    });
    
    return {
        total: memories.length,
        totalDuration,
        languages: Object.keys(languageCount).map(lang => ({
            language: lang,
            count: languageCount[lang]
        }))
    };
};