import React, { useState, useEffect } from 'react';
import { searchMemory, getAllMemories, deleteMemory } from './api';

function MemorySearch() {
    const [query, setQuery] = useState('');
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        try {
            const results = await searchMemory(query);
            setMemories(results);
        } catch (err) {
            setError('Failed to search memories.');
        }
        setLoading(false);
    };

    const loadAllMemories = async () => {
        setLoading(true);
        setError('');
        try {
            const allMemories = await getAllMemories();
            setMemories(allMemories);
        } catch (err) {
            setError('Failed to load memories.');
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        setLoading(true);
        setError('');
        try {
            const response = await deleteMemory(id);
            if (response.error) {
                setError(response.error);
            } else {
                loadAllMemories(); // refresh list
            }
        } catch (err) {
            setError('Failed to delete memory.');
        }
        setLoading(false);
    };

    useEffect(() => {
        loadAllMemories();
    }, []);

    return (
        <div>
            <h2>Search Memories</h2>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by transcript..."
            />
            <button onClick={handleSearch}>Search</button>
            <button onClick={loadAllMemories}>View All Memories</button>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <ul>
                {memories.map(memory => (
                    <li key={memory._id}>
                        <p><strong>Transcript:</strong> {memory.transcript}</p>
                        <p><strong>Frames:</strong></p>
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            {memory.keyframes.map((frame, index) => (
                                <img key={index} src={frame} alt={`frame ${index}`} width="100" />
                            ))}
                        </div>
                        <button onClick={() => handleDelete(memory._id)}>Delete Memory</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MemorySearch;
