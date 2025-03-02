import React, { useState } from 'react';
import MemoryUploader from './MemoryUploader';
import MemorySearch from './MemorySearch';

function App() {
    const [view, setView] = useState('upload');

    return (
        <div style={styles.container}>
            <nav style={styles.navbar}>
                <button 
                    onClick={() => setView('upload')}
                    style={view === 'upload' ? styles.activeButton : styles.button}
                >
                    Upload Memory
                </button>
                <button 
                    onClick={() => setView('search')}
                    style={view === 'search' ? styles.activeButton : styles.button}
                >
                    Search Memory
                </button>
            </nav>
            <div style={styles.content}>
                {view === 'upload' ? <MemoryUploader /> : <MemorySearch />}
            </div>
        </div>
    );
}

const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        backgroundColor: '#f0f0f0',
        minHeight: '100vh'
    },
    navbar: {
        marginBottom: '20px',
        display: 'flex',
        gap: '10px',
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '5px',
        outline: 'none'
    },
    activeButton: {
        padding: '10px 20px',
        backgroundColor: '#0056b3',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '5px',
        outline: 'none'
    },
    content: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    }
};

export default App;
