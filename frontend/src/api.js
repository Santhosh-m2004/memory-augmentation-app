const BASE_URL = 'http://localhost:5000';

export const registerUser = async (email, password, name) => {
    const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
    }
    
    return await response.json();
};

export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
            throw new Error(responseData.error || 'Login failed');
        }
        
        return responseData;
    } catch (error) {
        console.error('Login API error:', error);
        throw error;
    }
};

export const getProfile = async (token) => {
    const response = await fetch(`${BASE_URL}/profile`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch profile');
    }
    
    return await response.json();
};

export const uploadMemory = async (file, token) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
    }
    
    return await response.json();
};

export const getProcessingStatus = async (filename, token) => {
    const response = await fetch(`${BASE_URL}/processing-status/${filename}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return await response.json();
};

export const searchMemory = async (query, token) => {
    const response = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Search failed');
    }
    
    return await response.json();
};

export const getAllMemories = async (token) => {
    const response = await fetch(`${BASE_URL}/memories`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return await response.json();
};

export const deleteMemory = async (id, token) => {
    const response = await fetch(`${BASE_URL}/delete/${id}`, { 
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
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

export const getMemoryStats = async (token) => {
    try {
        const memories = await getAllMemories(token);
        
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
    } catch (error) {
        console.error('Failed to get memory stats:', error);
        return {
            total: 0,
            totalDuration: 0,
            languages: []
        };
    }
};