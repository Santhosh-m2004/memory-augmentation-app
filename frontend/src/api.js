const BASE_URL = 'http://localhost:5000';

export const uploadMemory = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
    });
    return await response.json();
};

export const searchMemory = async (query) => {
    const response = await fetch(`${BASE_URL}/search?query=${query}`);
    return await response.json();
};

export const getAllMemories = async () => {
    const response = await fetch(`${BASE_URL}/memories`);
    return await response.json();
};

export const deleteMemory = async (id) => {
    const response = await fetch(`${BASE_URL}/delete/${id}`, { method: 'DELETE' });
    return await response.json();
};

