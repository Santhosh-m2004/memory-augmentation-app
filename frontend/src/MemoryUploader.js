import React, { useState } from 'react';
import { uploadMemory } from './api';

function MemoryUploader() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        setMessage('');
        setError('');

        if (!file) {
            setError('Please select a file first.');
            return;
        }

        setLoading(true);
        try {
            const result = await uploadMemory(file);
            setMessage(result.message || 'Memory uploaded successfully!');
        } catch (err) {
            setError('Failed to upload memory. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div>
            <h2>Upload Memory</h2>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button onClick={handleUpload} disabled={loading}>
                {loading ? 'Uploading...' : 'Upload'}
            </button>

            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default MemoryUploader;
