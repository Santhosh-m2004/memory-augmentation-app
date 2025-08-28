import React, { useState, useEffect } from 'react';
import { searchMemory, getAllMemories, deleteMemory, getMemoryStats } from './api';

// Comprehensive language code to full name mapping
const LANGUAGE_MAP = {
  // Major world languages
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'zh': 'Chinese (Mandarin)',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ar': 'Arabic',
  
  // Indian languages
  'hi': 'Hindi',
  'bn': 'Bengali',
  'te': 'Telugu',
  'mr': 'Marathi',
  'ta': 'Tamil',
  'ur': 'Urdu',
  'gu': 'Gujarati',
  'kn': 'Kannada',
  'ml': 'Malayalam',
  'pa': 'Punjabi',
  'or': 'Odia',
  'as': 'Assamese',
  'mai': 'Maithili',
  'sd': 'Sindhi',
  'ks': 'Kashmiri',
  'ne': 'Nepali',
  'sa': 'Sanskrit',
  'kok': 'Konkani',
  'doi': 'Dogri',
  'mni': 'Manipuri',
  'sat': 'Santali',
  'brx': 'Bodo',
  
  // Other Asian languages
  'th': 'Thai',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'ms': 'Malay',
  'fil': 'Filipino',
  'my': 'Burmese',
  'km': 'Khmer',
  'lo': 'Lao',
  'mn': 'Mongolian',
  
  // European languages
  'nl': 'Dutch',
  'sv': 'Swedish',
  'pl': 'Polish',
  'tr': 'Turkish',
  'fa': 'Persian (Farsi)',
  'he': 'Hebrew',
  'el': 'Greek',
  'da': 'Danish',
  'fi': 'Finnish',
  'no': 'Norwegian',
  'hu': 'Hungarian',
  'cs': 'Czech',
  'ro': 'Romanian',
  'uk': 'Ukrainian',
  'ca': 'Catalan',
  'sk': 'Slovak',
  'hr': 'Croatian',
  'bg': 'Bulgarian',
  'lt': 'Lithuanian',
  'sl': 'Slovenian',
  'lv': 'Latvian',
  'et': 'Estonian',
  'mt': 'Maltese',
  'ga': 'Irish',
  'gd': 'Scottish Gaelic',
  'cy': 'Welsh',
  'eu': 'Basque',
  'gl': 'Galician',
  'is': 'Icelandic',
  
  // African languages
  'sw': 'Swahili',
  'am': 'Amharic',
  'ha': 'Hausa',
  'yo': 'Yoruba',
  'zu': 'Zulu',
  'xh': 'Xhosa',
  'af': 'Afrikaans',
  'st': 'Southern Sotho',
  'tn': 'Tswana',
  'ts': 'Tsonga',
  'ss': 'Swati',
  've': 'Venda',
  'nr': 'Southern Ndebele',
  
  // Other languages
  'haw': 'Hawaiian',
  'mi': 'Maori',
  'sm': 'Samoan',
  'to': 'Tongan',
  'fj': 'Fijian',
  'ty': 'Tahitian',
  
  'unknown': 'Unknown',
  '': 'Not detected'
};

function MemorySearch() {
  const [query, setQuery] = useState('');
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [fullScreenImage, setFullScreenImage] = useState(false);

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

  const getLanguageName = (code) => {
    return LANGUAGE_MAP[code] || code || 'Unknown';
  };

  const handleNextFrame = () => {
    if (selectedMemory && selectedMemory.keyframes) {
      setCurrentFrameIndex((prevIndex) => 
        (prevIndex + 1) % selectedMemory.keyframes.length
      );
    }
  };

  const handlePrevFrame = () => {
    if (selectedMemory && selectedMemory.keyframes) {
      setCurrentFrameIndex((prevIndex) => 
        (prevIndex - 1 + selectedMemory.keyframes.length) % selectedMemory.keyframes.length
      );
    }
  };

  const handleKeyDown = (e) => {
    if (fullScreenImage) {
      if (e.key === 'Escape') {
        setFullScreenImage(false);
      } else if (e.key === 'ArrowRight') {
        handleNextFrame();
      } else if (e.key === 'ArrowLeft') {
        handlePrevFrame();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fullScreenImage, selectedMemory]);

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
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    frameViewer: {
      position: 'relative',
      width: '100%',
      height: '300px',
      overflow: 'hidden',
      borderRadius: '8px',
    },
    frameImage: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      cursor: 'zoom-in',
    },
    frameNavigation: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    navButton: {
      background: 'rgba(138, 127, 255, 0.3)',
      color: '#e0e0ff',
      border: 'none',
      borderRadius: '4px',
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
    frameCounter: {
      color: '#a0a0e0',
      fontSize: '0.9rem',
    },
    thumbnails: {
      display: 'flex',
      gap: '0.5rem',
      overflowX: 'auto',
      padding: '0.5rem 0',
    },
    thumbnail: {
      width: '60px',
      height: '60px',
      objectFit: 'cover',
      borderRadius: '4px',
      cursor: 'pointer',
      opacity: 0.6,
      transition: 'opacity 0.3s ease',
    },
    thumbnailActive: {
      opacity: 1,
      border: '2px solid #8a7fff',
    },
    fullScreenModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
    },
    fullScreenContent: {
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    fullScreenImage: {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
    },
    fullScreenNav: {
      position: 'absolute',
      top: '50%',
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0 2rem',
      transform: 'translateY(-50%)',
      zIndex: 2001,
    },
    fullScreenNavButton: {
      background: 'rgba(0, 0, 0, 0.5)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '50px',
      height: '50px',
      fontSize: '1.5rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    fullScreenClose: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'rgba(0, 0, 0, 0.5)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      fontSize: '1.2rem',
      cursor: 'pointer',
      zIndex: 2001,
    },
    fullScreenCounter: {
      position: 'absolute',
      bottom: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0, 0, 0, 0.5)',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: '0.9rem',
    },
    languageInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1rem',
      padding: '0.5rem',
      background: 'rgba(138, 127, 255, 0.1)',
      borderRadius: '6px',
    },
    languageFlag: {
      fontSize: '1.5rem',
    },
    languageText: {
      fontWeight: 'bold',
      color: '#c6a3ff',
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

  // Function to get a flag emoji based on language (simplified)
  const getLanguageFlag = (languageCode) => {
    const flagMap = {
      'en': '🇺🇸', 'es': '🇪🇸', 'fr': '🇫🇷', 'de': '🇩🇪', 'it': '🇮🇹', 'pt': '🇵🇹', 'ru': '🇷🇺',
      'zh': '🇨🇳', 'ja': '🇯🇵', 'ko': '🇰🇷', 'ar': '🇸🇦', 'hi': '🇮🇳', 'bn': '🇧🇩', 'te': '🇮🇳',
      'mr': '🇮🇳', 'ta': '🇮🇳', 'ur': '🇵🇰', 'gu': '🇮🇳', 'kn': '🇮🇳', 'ml': '🇮🇳', 'pa': '🇮🇳',
      'th': '🇹🇭', 'vi': '🇻🇳', 'id': '🇮🇩', 'tr': '🇹🇷', 'nl': '🇳🇱', 'sv': '🇸🇪', 'pl': '🇵🇱',
      // Add more flag mappings as needed
    };
    
    return flagMap[languageCode] || '🌐';
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
                    {getLanguageName(memory.detected_language) || 'Unknown'}
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
                    onClick={() => {
                      setSelectedMemory(memory);
                      setCurrentFrameIndex(0);
                    }}
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
      
      {selectedMemory && !fullScreenImage && (
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
              <div style={styles.languageInfo}>
                <span style={styles.languageFlag}>{getLanguageFlag(selectedMemory.detected_language)}</span>
                <span style={styles.languageText}>
                  Detected Language: {getLanguageName(selectedMemory.detected_language)}
                </span>
              </div>
              
              <div style={styles.memoryMeta}>
                <span><strong>Duration:</strong> {formatDuration(selectedMemory.duration)}</span>
                <span><strong>Uploaded:</strong> {selectedMemory.upload_date || 'Unknown date'}</span>
              </div>
              
              <h3>Transcript</h3>
              <div style={styles.modalTranscript}>
                {selectedMemory.translated_transcript || selectedMemory.transcript || 'No transcript available'}
              </div>
              
              {selectedMemory.keyframes && selectedMemory.keyframes.length > 0 && (
                <>
                  <h3>Key Frames</h3>
                  <div style={styles.modalFrames}>
                    <div style={styles.frameViewer}>
                      <img 
                        src={selectedMemory.keyframes[currentFrameIndex]} 
                        alt={`Frame ${currentFrameIndex + 1}`}
                        style={styles.frameImage}
                        onClick={() => setFullScreenImage(true)}
                      />
                    </div>
                    
                    <div style={styles.frameNavigation}>
                      <button 
                        style={styles.navButton}
                        onClick={handlePrevFrame}
                        disabled={selectedMemory.keyframes.length <= 1}
                      >
                        Previous
                      </button>
                      
                      <div style={styles.frameCounter}>
                        {currentFrameIndex + 1} / {selectedMemory.keyframes.length}
                      </div>
                      
                      <button 
                        style={styles.navButton}
                        onClick={handleNextFrame}
                        disabled={selectedMemory.keyframes.length <= 1}
                      >
                        Next
                      </button>
                    </div>
                    
                    {selectedMemory.keyframes.length > 1 && (
                      <div style={styles.thumbnails}>
                        {selectedMemory.keyframes.map((frame, index) => (
                          <img
                            key={index}
                            src={frame}
                            alt={`Thumbnail ${index + 1}`}
                            style={{
                              ...styles.thumbnail,
                              ...(index === currentFrameIndex ? styles.thumbnailActive : {})
                            }}
                            onClick={() => setCurrentFrameIndex(index)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {fullScreenImage && (
        <div style={styles.fullScreenModal}>
          <div style={styles.fullScreenContent}>
            <img 
              src={selectedMemory.keyframes[currentFrameIndex]} 
              alt={`Frame ${currentFrameIndex + 1}`}
              style={styles.fullScreenImage}
            />
            
            <div style={styles.fullScreenNav}>
              <button 
                style={styles.fullScreenNavButton}
                onClick={handlePrevFrame}
                disabled={selectedMemory.keyframes.length <= 1}
              >
                &#10094;
              </button>
              
              <button 
                style={styles.fullScreenNavButton}
                onClick={handleNextFrame}
                disabled={selectedMemory.keyframes.length <= 1}
              >
                &#10095;
              </button>
            </div>
            
            <button 
              style={styles.fullScreenClose}
              onClick={() => setFullScreenImage(false)}
            >
              ×
            </button>
            
            <div style={styles.fullScreenCounter}>
              {currentFrameIndex + 1} / {selectedMemory.keyframes.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemorySearch;