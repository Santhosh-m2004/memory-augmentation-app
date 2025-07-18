import React, { useState, useEffect } from 'react';
import MemoryUploader from './MemoryUploader';
import MemorySearch from './MemorySearch';

function App() {
    const [view, setView] = useState('upload');
    const [isHovered, setIsHovered] = useState(null);
    const [memoryCount, setMemoryCount] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    // Update time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={styles.container}>
            {/* Background Bubbles */}
            <div style={styles.bubble1}></div>
            <div style={styles.bubble2}></div>
            <div style={styles.bubble3}></div>

            {/* Header */}
            <header style={styles.header}>
                <h1 style={styles.title}>NeuroSync <span style={styles.betaTag}>BETA</span></h1>
                <p style={styles.subtitle}>Cognitive Memory Archiving System</p>
            </header>

            {/* Dashboard */}
            <div style={styles.dashboard}>
                {/* Sidebar */}
                <nav style={styles.sidebar}>
                    <button
                        onClick={() => setView('upload')}
                        onMouseEnter={() => setIsHovered('upload')}
                        onMouseLeave={() => setIsHovered(null)}
                        style={view === 'upload' ?
                            styles.activeNavButton :
                            (isHovered === 'upload' ? styles.hoveredNavButton : styles.navButton)
                        }
                    >
                        <div style={styles.buttonIcon}>🧠</div>
                        <div>
                            <div style={styles.buttonTitle}>Upload Memory</div>
                            <div style={styles.buttonSubtitle}>Encode new experiences</div>
                        </div>
                    </button>

                    <div style={styles.divider}></div>

                    <button
                        onClick={() => setView('search')}
                        onMouseEnter={() => setIsHovered('search')}
                        onMouseLeave={() => setIsHovered(null)}
                        style={view === 'search' ?
                            styles.activeNavButton :
                            (isHovered === 'search' ? styles.hoveredNavButton : styles.navButton)
                        }
                    >
                        <div style={styles.buttonIcon}>🔍</div>
                        <div>
                            <div style={styles.buttonTitle}>Retrieve Memory</div>
                            <div style={styles.buttonSubtitle}>Access stored memories</div>
                        </div>
                    </button>

                    {/* Status Panel */}
                    <div style={styles.statusPanel}>
                        <div style={styles.statusHeader}>SYSTEM STATUS</div>
                        <div style={styles.statusItem}>
                            <div style={styles.statusIndicator}></div>
                            <div>Neural Network: <span style={styles.statusValue}>Online</span></div>
                        </div>
                        <div style={styles.statusItem}>
                            <div style={styles.statusIndicator}></div>
                            <div>Memory Bank: <span style={styles.statusValue}>84% Capacity</span></div>
                        </div>
                        <div style={styles.statusItem}>
                            <div style={styles.statusIndicator}></div>
                            <div>Security: <span style={styles.statusValue}>Encrypted</span></div>
                        </div>
                    </div>
                </nav>

                {/* Content Area */}
                <div style={styles.content}>
                    <div style={styles.contentHeader}>
                        <div style={styles.currentModule}>
                            {view === 'upload' ? 'MEMORY ENCODING' : 'NEURAL RETRIEVAL'}
                        </div>
                        <div style={styles.stats}>
                            <div style={styles.statItem}>
                                <div style={styles.statValue}>{memoryCount}</div>
                                <div style={styles.statLabel}>Memories Stored</div>
                            </div>
                            <div style={styles.statItem}>
                            </div>
                        </div>
                    </div>

                    <div style={styles.moduleContainer}>
                        {view === 'upload'
                            ? <MemoryUploader setMemoryCount={setMemoryCount} />
                            : <MemorySearch />}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer style={styles.footer}>
    <div>Memory Augmentation Platform v1.0</div>
    <div>Today: {new Date().toLocaleString()}</div>
    <div>© {new Date().getFullYear()}</div>
</footer>
        </div>
    );
}
const styles = {
    container: {
        fontFamily: "'Inter', sans-serif",
        minHeight: '100vh',
        backgroundColor: '#0f0c29',
        background: 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)',
        color: '#e0e0ff',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
    },
    bubble1: {
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(96, 76, 220, 0.3) 0%, transparent 70%)',
        top: '-100px',
        right: '-100px',
        zIndex: 0,
    },
    bubble2: {
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 16, 157, 0.2) 0%, transparent 70%)',
        bottom: '-200px',
        left: '-200px',
        zIndex: 0,
    },
    bubble3: {
        position: 'absolute',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(111, 66, 193, 0.4) 0%, transparent 70%)',
        top: '40%',
        left: '30%',
        zIndex: 0,
    },
    header: {
        textAlign: 'center',
        marginBottom: '30px',
        position: 'relative',
        zIndex: 2,
    },
    title: {
        fontSize: '3.5rem',
        fontWeight: '800',
        background: 'linear-gradient(90deg, #8a7fff, #c6a3ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '5px',
        letterSpacing: '-1px',
    },
    betaTag: {
        fontSize: '1rem',
        background: '#ff4081',
        color: '#fff',
        borderRadius: '20px',
        padding: '3px 12px',
        verticalAlign: 'super',
        marginLeft: '10px',
    },
    subtitle: {
        fontSize: '1.2rem',
        color: '#a0a0e0',
        fontWeight: '300',
    },
    dashboard: {
        display: 'flex',
        maxWidth: '1400px',
        margin: '0 auto',
        height: '75vh',
        position: 'relative',
        zIndex: 2,
    },
    sidebar: {
        width: '300px',
        backgroundColor: 'rgba(25, 22, 56, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '25px',
        marginRight: '25px',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    },
    navButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '20px',
        marginBottom: '15px',
        borderRadius: '15px',
        background: 'rgba(60, 50, 130, 0.4)',
        border: 'none',
        color: '#d0d0ff',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textAlign: 'left',
    },
    hoveredNavButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '20px',
        marginBottom: '15px',
        borderRadius: '15px',
        background: 'rgba(96, 76, 220, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#fff',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textAlign: 'left',
        transform: 'translateY(-2px)',
        boxShadow: '0 5px 15px rgba(96, 76, 220, 0.2)',
    },
    activeNavButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '20px',
        marginBottom: '15px',
        borderRadius: '15px',
        background: 'rgba(96, 76, 220, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#fff',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textAlign: 'left',
        transform: 'translateY(-2px)',
        boxShadow: '0 5px 20px rgba(96, 76, 220, 0.4)',
    },
    buttonIcon: {
        fontSize: '2rem',
    },
    buttonTitle: {
        fontWeight: '600',
        fontSize: '1.1rem',
    },
    buttonSubtitle: {
        fontSize: '0.85rem',
        color: '#a0a0e0',
        opacity: 0.8,
        marginTop: '5px',
    },
    divider: {
        height: '1px',
        background: 'rgba(255, 255, 255, 0.1)',
        margin: '20px 0',
    },
    statusPanel: {
        marginTop: 'auto',
        background: 'rgba(20, 15, 50, 0.5)',
        borderRadius: '15px',
        padding: '20px',
    },
    statusHeader: {
        textTransform: 'uppercase',
        fontSize: '0.8rem',
        letterSpacing: '1px',
        marginBottom: '15px',
        color: '#8a7fff',
        fontWeight: '600',
    },
    statusItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px',
        fontSize: '0.9rem',
    },
    statusIndicator: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: '#4caf50',
        boxShadow: '0 0 10px #4caf50',
    },
    statusValue: {
        fontWeight: '600',
        color: '#8a7fff',
    },
    content: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    contentHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
    },
    currentModule: {
        fontSize: '1.8rem',
        fontWeight: '700',
        background: 'linear-gradient(90deg, #c6a3ff, #8a7fff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    stats: {
        display: 'flex',
        gap: '25px',
    },
    statItem: {
        textAlign: 'center',
    },
    statValue: {
        fontSize: '2.2rem',
        fontWeight: '800',
        background: 'linear-gradient(90deg, #8a7fff, #c6a3ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    statLabel: {
        fontSize: '0.9rem',
        color: '#a0a0e0',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    moduleContainer: {
        backgroundColor: 'rgba(25, 22, 56, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '30px',
        flex: 1,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        overflowY: 'auto',
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '30px',
        padding: '15px 30px',
        fontSize: '0.9rem',
        color: '#a0a0e0',
        background: 'rgba(20, 15, 50, 0.4)',
        borderRadius: '15px',
        maxWidth: '1400px',
        margin: '30px auto 0',
        position: 'relative',
        zIndex: 2,
    }
};

export default App;
