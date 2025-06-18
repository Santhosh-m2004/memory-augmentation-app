import React, { useState } from 'react';
import { uploadMemory } from './api';

function MemoryUploader({ setMemoryCount }) {
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
            setMemoryCount(prev => prev + 1);  // 🔼 Update memory count after successful upload
        } catch (err) {
            setError('Failed to upload memory. Please try again.');
        }
        setLoading(false);
    };

    const styles = {
        container: {
            maxWidth: '400px',
            margin: '60px auto',
            padding: '30px',
            background: '#f9f9f9',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            fontFamily: 'Segoe UI, sans-serif',
            textAlign: 'center',
        },
        title: {
            fontSize: '24px',
            marginBottom: '20px',
            color: '#333',
        },
        fileInput: {
            marginBottom: '20px',
            padding: '8px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
            width: '100%',
        },
        button: {
            backgroundColor: loading ? '#bbb' : '#4a90e2',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease',
        },
        successMessage: {
            color: '#2e7d32',
            marginTop: '15px',
            fontWeight: '500',
        },
        errorMessage: {
            color: '#c62828',
            marginTop: '15px',
            fontWeight: '500',
        },
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Upload Memory</h2>
            <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                style={styles.fileInput}
            />
            <button
                onClick={handleUpload}
                disabled={loading}
                style={styles.button}
            >
                {loading ? 'Uploading...' : 'Upload'}
            </button>

            {message && <p style={styles.successMessage}>{message}</p>}
            {error && <p style={styles.errorMessage}>{error}</p>}
        </div>
    );
}

export default MemoryUploader;
