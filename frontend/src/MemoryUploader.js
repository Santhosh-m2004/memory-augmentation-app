import React, { useState, useRef } from 'react';
import { uploadMemory, getProcessingStatus } from './api';

function MemoryUploader({ setMemoryCount, onUploadComplete }) {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        
        // Validate file type
        const allowedTypes = ['audio/', 'video/'];
        if (!allowedTypes.some(type => selectedFile.type.includes(type))) {
            setError('Please select an audio or video file');
            return;
        }
        
        // Validate file size (max 100MB)
        if (selectedFile.size > 100 * 1024 * 1024) {
            setError('File size must be less than 100MB');
            return;
        }
        
        setFile(selectedFile);
        setError('');
        setMessage('');
    };

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
            setMessage('Upload started. Processing in progress...');
            setProcessing(true);
            setProgress(10);
            setStatusMessage('File uploaded, starting processing...');
            
            // Poll for processing status
            const checkStatus = async (filename) => {
                try {
                    const status = await getProcessingStatus(filename);
                    setProgress(status.progress);
                    setStatusMessage(status.message);
                    
                    if (status.status === 'processing') {
                        setTimeout(() => checkStatus(filename), 2000);
                    } else if (status.status === 'completed') {
                        setMessage('Memory processed successfully!');
                        setProcessing(false);
                        setMemoryCount(prev => prev + 1);
                        if (onUploadComplete) onUploadComplete();
                        // Reset form
                        setFile(null);
                        if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                        }
                    } else if (status.status === 'error') {
                        setError(status.message);
                        setProcessing(false);
                    }
                } catch (err) {
                    setError('Failed to check processing status');
                    setProcessing(false);
                }
            };
            
            checkStatus(result.filename);
            
        } catch (err) {
            setError(err.message || 'Failed to upload memory. Please try again.');
            setLoading(false);
        }
    };

    const styles = {
        container: {
            padding: '2rem',
            background: 'rgba(30, 30, 60, 0.5)',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '600px',
            margin: '0 auto',
        },
        title: {
            fontSize: '1.5rem',
            marginBottom: '1.5rem',
            color: '#e0e0ff',
            textAlign: 'center',
        },
        dropZone: {
            border: '2px dashed rgba(138, 127, 255, 0.5)',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
        },
        dropZoneActive: {
            borderColor: '#8a7fff',
            backgroundColor: 'rgba(138, 127, 255, 0.1)',
        },
        fileInput: {
            display: 'none',
        },
        fileInfo: {
            marginTop: '1rem',
            padding: '1rem',
            background: 'rgba(40, 40, 70, 0.5)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        fileName: {
            fontSize: '1rem',
            color: '#e0e0ff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '70%',
        },
        removeButton: {
            background: 'rgba(255, 100, 100, 0.2)',
            border: 'none',
            color: '#ff6464',
            borderRadius: '4px',
            padding: '0.5rem',
            cursor: 'pointer',
        },
        button: {
            backgroundColor: loading ? '#666' : '#8a7fff',
            color: 'white',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            width: '100%',
            transition: 'all 0.3s ease',
            marginTop: '1rem',
        },
        progressContainer: {
            marginTop: '1.5rem',
        },
        progressBar: {
            height: '8px',
            background: 'rgba(40, 40, 70, 0.5)',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '0.5rem',
        },
        progressFill: {
            height: '100%',
            background: 'linear-gradient(90deg, #8a7fff, #c6a3ff)',
            transition: 'width 0.3s ease',
        },
        progressText: {
            fontSize: '0.9rem',
            color: '#a0a0e0',
            textAlign: 'center',
        },
        successMessage: {
            color: '#4caf50',
            marginTop: '1rem',
            textAlign: 'center',
            padding: '1rem',
            background: 'rgba(76, 175, 80, 0.1)',
            borderRadius: '8px',
        },
        errorMessage: {
            color: '#f44336',
            marginTop: '1rem',
            textAlign: 'center',
            padding: '1rem',
            background: 'rgba(244, 67, 54, 0.1)',
            borderRadius: '8px',
        },
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Upload New Memory</h2>
            
            <div 
                style={{...styles.dropZone, ...(file ? styles.dropZoneActive : {})}}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.backgroundColor = 'rgba(138, 127, 255, 0.1)';
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.backgroundColor = 'transparent';
                    if (e.dataTransfer.files.length > 0) {
                        handleFileChange({ target: { files: e.dataTransfer.files } });
                    }
                }}
            >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
                <p>Drag & drop your audio or video file here</p>
                <p style={{ fontSize: '0.9rem', color: '#a0a0e0', marginTop: '0.5rem' }}>
                    Supported formats: MP3, WAV, MP4, MOV, AVI, MKV
                </p>
                <button style={{ 
                    marginTop: '1rem', 
                    background: 'rgba(138, 127, 255, 0.2)', 
                    border: '1px solid rgba(138, 127, 255, 0.5)',
                    color: '#e0e0ff',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                }}>
                    Browse Files
                </button>
            </div>
            
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={styles.fileInput}
                accept="audio/*,video/*"
            />
            
            {file && (
                <div style={styles.fileInfo}>
                    <div style={styles.fileName}>{file.name}</div>
                    <button 
                        style={styles.removeButton}
                        onClick={() => {
                            setFile(null);
                            if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                            }
                        }}
                    >
                        Remove
                    </button>
                </div>
            )}
            
            <button
                onClick={handleUpload}
                disabled={loading || !file || processing}
                style={styles.button}
            >
                {processing ? 'Processing...' : (loading ? 'Uploading...' : 'Upload Memory')}
            </button>
            
            {(processing || progress > 0) && (
                <div style={styles.progressContainer}>
                    <div style={styles.progressBar}>
                        <div style={{...styles.progressFill, width: `${progress}%`}}></div>
                    </div>
                    <div style={styles.progressText}>
                        {statusMessage} ({Math.round(progress)}%)
                    </div>
                </div>
            )}
            
            {message && <div style={styles.successMessage}>{message}</div>}
            {error && <div style={styles.errorMessage}>{error}</div>}
        </div>
    );
}

export default MemoryUploader;