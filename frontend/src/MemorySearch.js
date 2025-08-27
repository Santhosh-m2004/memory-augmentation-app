import React, { useState, useEffect } from 'react';
import { searchMemory, getAllMemories, deleteMemory, getMemoryStats } from './api';

function MemorySearch() {
    const [query, setQuery] = useState('');
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState(null);
    const [selectedMemory, setSelectedMemory] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    const handleSearch = async () => {
        if (query.length < 2) {
            setError('Search query must be at least 2 characters long');
            return;
        }
        
        setLoading(true);
        setError('');
        try {
            const results = await searchMemory(query);
            setMemories(results);
        } catch (err) {
            setError(err.message || 'Failed to search memories.');
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
            setError(err.message || 'Failed to load memories.');
        }
        setLoading(false);
    };
    
    const loadStats = async () => {
        try {
            const statsData = await getMemoryStats();
            setStats(statsData);
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
            return;
        }
        
        setLoading(true);
        setError('');
        try {
            await deleteMemory(id);
            loadAllMemories(); // refresh list
            loadStats(); // refresh stats
        } catch (err) {
            setError(err.message || 'Failed to delete memory.');
        }
        setLoading(false);
    };

    useEffect(() => {
        loadAllMemories();
        loadStats();
    }, []);

    const formatDuration = (seconds) => {
        if (!seconds) return '0s';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };

    const styles = {
        container: {
            padding: '0',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
        },
        searchBox: {
            display: 'flex',
            gap: '1rem',
            flex: 1,
            minWidth: '300px',
        },
        searchInput: {
            flex: 1,
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid rgba(138, 127, 255, 0.3)',
            background: 'rgba(30, 30, 60, 0.5)',
            color: '#e0e0ff',
            fontSize: '1rem',
        },
        searchButton: {
            padding: '1rem 1.5rem',
            background: '#8a7fff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
        },
        viewToggle: {
            display: 'flex',
            background: 'rgba(40, 40, 70, 0.5)',
            borderRadius: '8px',
            overflow: 'hidden',
        },
        viewToggleButton: {
            padding: '0.5rem 1rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#a0a0e0',
        },
        viewToggleButtonActive: {
            background: 'rgba(138, 127, 255, 0.3)',
            color: '#e0e0ff',
        },
        stats: {
            display: 'flex',
            gap: '2rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
        },
        statItem: {
            background: 'rgba(30, 30, 60, 0.5)',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            border: '1px solid rgba(138, 127, 255, 0.2)',
            minWidth: '150px',
        },
        statValue: {
            fontSize: '1.8rem',
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #8a7fff, #c6a3ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
        },
        statLabel: {
            fontSize: '0.9rem',
            color: '#a0a0e0',
        },
        memoryGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
        },
        memoryList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
        },
        memoryCard: {
            background: 'rgba(30, 30, 60, 0.5)',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(138, 127, 255, 0.2)',
            transition: 'all 0.3s ease',
        },
        memoryCardList: {
            display: 'flex',
            flexDirection: 'row',
        },
        memoryImage: {
            width: '100%',
            height: '200px',
            objectFit: 'cover',
        },
        memoryImageList: {
            width: '200px',
            height: '150px',
        },
        memoryContent: {
            padding: '1.5rem',
        },
        memoryTitle: {
            fontSize: '1.1rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: '#e0e0ff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        memoryLanguage: {
            background: 'rgba(138, 127, 255, 0.2)',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.7rem',
            color: '#c6a3ff',
        },
        memoryText: {
            color: '#c0c0e0',
            fontSize: '0.9rem',
            lineHeight: '1.5',
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
        },
        memoryMeta: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: '#a0a0e0',
        },
        memoryActions: {
            display: 'flex',
            gap: '0.5rem',
            marginTop: '1rem',
        },
        actionButton: {
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 'bold',
        },
        viewButton: {
            background: 'rgba(138, 127, 255, 0.2)',
            color: '#c6a3ff',
        },
        deleteButton: {
            background: 'rgba(255, 100, 100, 0.2)',
            color: '#ff6464',
        },
        modal: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem',
        },
        modalContent: {
            background: 'rgba(30, 30, 60, 0.95)',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid rgba(138, 127, 255, 0.3)',
        },
        modalHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
        },
        modalTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#e0e0ff',
        },
        closeButton: {
            background: 'none',
            border: 'none',
            color: '#a0a0e0',
            fontSize: '1.5rem',
            cursor: 'pointer',
        },
        modalBody: {
            marginBottom: '1.5rem',
        },
        modalTranscript: {
            background: 'rgba(40, 40, 70, 0.5)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            lineHeight: '1.6',
            color: '#c0c0e0',
        },
        modalFrames: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
        },
        modalFrame: {
            width: '100%',
            borderRadius: '8px',
            overflow: 'hidden',
        },
        modalImage: {
            width: '100%',
            height: '150px',
            objectFit: 'cover',
        },
        loading: {
            textAlign: 'center',
            padding: '2rem',
            color: '#a0a0e0',
        },
        error: {
            background: 'rgba(244, 67, 54, 0.1)',
            color: '#f44336',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
        },
        emptyState: {
            textAlign: 'center',
            padding: '3rem',
            color: '#a0a0e0',
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.searchBox}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search memories..."
                        style={styles.searchInput}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch} style={styles.searchButton}>
                        Search
                    </button>
                </div>
                
                <div style={styles.viewToggle}>
                    <button 
                        style={{
                            ...styles.viewToggleButton,
                            ...(viewMode === 'grid' ? styles.viewToggleButtonActive : {})
                        }}
                        onClick={() => setViewMode('grid')}
                    >
                        Grid
                    </button>
                    <button 
                        style={{
                            ...styles.viewToggleButton,
                            ...(viewMode === 'list' ? styles.viewToggleButtonActive : {})
                        }}
                        onClick={() => setViewMode('list')}
                    >
                        List
                    </button>
                </div>
            </div>
            
            {stats && (
                <div style={styles.stats}>
                    <div style={styles.statItem}>
                        <div style={styles.statValue}>{stats.total}</div>
                        <div style={styles.statLabel}>Total Memories</div>
                    </div>
                    <div style={styles.statItem}>
                        <div style={styles.statValue}>{formatDuration(stats.totalDuration)}</div>
                        <div style={styles.statLabel}>Total Duration</div>
                    </div>
                    <div style={styles.statItem}>
                        <div style={styles.statValue}>{stats.languages.length}</div>
                        <div style={styles.statLabel}>Languages</div>
                    </div>
                </div>
            )}
            
            <button 
                onClick={loadAllMemories}
                style={{
                    ...styles.searchButton,
                    background: 'rgba(138, 127, 255, 0.2)',
                    color: '#c6a3ff',
                    marginBottom: '1.5rem',
                }}
            >
                View All Memories
            </button>
            
            {error && <div style={styles.error}>{error}</div>}
            
            {loading ? (
                <div style={styles.loading}>
                    <div style={{fontSize: '2rem', marginBottom: '1rem'}}>⏳</div>
                    <p>Loading memories...</p>
                </div>
            ) : memories.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🔍</div>
                    <h3>No memories found</h3>
                    <p>Upload some memories or try a different search query</p>
                </div>
            ) : (
                <div style={viewMode === 'grid' ? styles.memoryGrid : styles.memoryList}>
                    {memories.map(memory => (
                        <div 
                            key={memory._id} 
                            style={{
                                ...styles.memoryCard,
                                ...(viewMode === 'list' ? styles.memoryCardList : {})
                            }}
                        >
                            {memory.keyframes && memory.keyframes.length > 0 && (
                                <img 
                                    src={memory.keyframes[0]} 
                                    alt="Memory preview" 
                                    style={{
                                        ...styles.memoryImage,
                                        ...(viewMode === 'list' ? styles.memoryImageList : {})
                                    }}
                                />
                            )}
                            <div style={styles.memoryContent}>
                                <div style={styles.memoryTitle}>
                                    <span>
                                        {memory.filename || 'Memory'}
                                    </span>
                                    <span style={styles.memoryLanguage}>
                                        {memory.detected_language || 'unknown'}
                                    </span>
                                </div>
                                <div style={styles.memoryText}>
                                    {memory.translated_transcript || memory.transcript || 'No transcript available'}
                                </div>
                                <div style={styles.memoryMeta}>
                                    <span>{formatDuration(memory.duration)}</span>
                                    <span>{memory.upload_date || 'Unknown date'}</span>
                                </div>
                                <div style={styles.memoryActions}>
                                    <button 
                                        style={{...styles.actionButton, ...styles.viewButton}}
                                        onClick={() => setSelectedMemory(memory)}
                                    >
                                        View Details
                                    </button>
                                    <button 
                                        style={{...styles.actionButton, ...styles.deleteButton}}
                                        onClick={() => handleDelete(memory._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {selectedMemory && (
                <div style={styles.modal} onClick={() => setSelectedMemory(null)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>{selectedMemory.filename}</h2>
                            <button 
                                style={styles.closeButton}
                                onClick={() => setSelectedMemory(null)}
                            >
                                ×
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={styles.memoryMeta}>
                                <span>Language: {selectedMemory.detected_language || 'unknown'}</span>
                                <span>Duration: {formatDuration(selectedMemory.duration)}</span>
                                <span>Uploaded: {selectedMemory.upload_date || 'Unknown date'}</span>
                            </div>
                            
                            <h3>Transcript</h3>
                            <div style={styles.modalTranscript}>
                                {selectedMemory.translated_transcript || selectedMemory.transcript || 'No transcript available'}
                            </div>
                            
                            {selectedMemory.keyframes && selectedMemory.keyframes.length > 0 && (
                                <>
                                    <h3>Key Frames</h3>
                                    <div style={styles.modalFrames}>
                                        {selectedMemory.keyframes.map((frame, index) => (
                                            <div key={index} style={styles.modalFrame}>
                                                <img 
                                                    src={frame} 
                                                    alt={`Frame ${index + 1}`}
                                                    style={styles.modalImage}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MemorySearch;