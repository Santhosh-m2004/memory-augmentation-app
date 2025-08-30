import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { loginUser } from './api';

const LoginForm = ({ onToggleForm }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showScrollContent, setShowScrollContent] = useState(false);

    const { login, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            window.location.reload();
        }
    }, [isAuthenticated]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            console.log('Attempting login with:', { email, password });
            const response = await loginUser(email, password);
            console.log('Login response:', response);
            login(response.user, response.access_token);
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) setShowScrollContent(true);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="app-container">
            <style>{`
                .app-container { min-height: 100vh; background-color: #030712; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 3rem 1rem; gap: 4rem; }
                .login-card { width: 100%; max-width: 400px; padding: 2.5rem; background-color: #111827; color: white; border-radius: 1.5rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid #1f2937; transition: all 0.3s ease-in-out; }
                .login-card:hover { transform: scale(1.01); }
                .header { text-align: center; margin-bottom: 1.5rem; }
                .header-title { font-size: 1.5rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #a855f7; }
                .header-subtitle { font-size: 0.875rem; font-weight: 300; color: #6b7280; margin-top: 0.25rem; }
                .welcome-title { font-size: 2rem; font-weight: 800; text-align: center; color: #e5e7eb; margin-bottom: 1.5rem; letter-spacing: -0.025em; }
                .error-message { background-color: #450a0a; color: #fca5a5; padding: 0.75rem 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; border: 1px solid #b91c1c; }
                .login-form { display: flex; flex-direction: column; gap: 1.25rem; }
                .form-input { width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 1px solid #374151; background-color: #1f2937; color: #d1d5db; transition: all 0.2s ease-in-out; }
                .form-input:focus { outline: none; border-color: #a855f7; box-shadow: 0 0 0 2px rgba(168,85,247,0.5); }
                .submit-button { width: 100%; padding: 0.75rem 1.5rem; background-color: #9333ea; color: white; font-weight: 600; border-radius: 0.75rem; transition: all 0.3s ease-in-out; cursor: pointer; }
                .submit-button:hover { transform: scale(1.05); background-color: #8b5cf6; }
                .submit-button.disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
                .toggle-text { text-align: center; margin-top: 1rem; color: #9ca3af; }
                .toggle-button { color: #c084fc; font-weight: 500; cursor: pointer; text-decoration: underline; border: none; background: none; }

                .scroll-content { width: 100%; max-width: 900px; padding: 2rem; background-color: #111827; color: white; border-radius: 1.5rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid #1f2937; opacity: 0; transform: translateY(4rem); transition: all 1s ease-in-out; }
                .scroll-content.visible { opacity: 1; transform: translateY(0); }
                .scroll-content-title { font-size: 1.875rem; font-weight: 700; margin-bottom: 1rem; text-align: center; color: #a855f7; }
                .scroll-content-text { color: #9ca3af; text-align: center; margin-bottom: 2rem; max-width: 48rem; margin-left: auto; margin-right: auto; }
                .content-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
                @media (min-width: 768px) { .content-grid { grid-template-columns: repeat(2,1fr); } }
                .content-heading { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; color: #e5e7eb; }
                .content-list { list-style-type: disc; list-style-position: inside; padding-left: 0; margin: 0; line-height: 1.5; }
                .content-list li { color: #9ca3af; margin-bottom: 0.5rem; }
                .content-list li strong { color: #d1d5db; }
            `}</style>

            <div className="login-card">
                <header className="header">
                    <h1 className="header-title">NeuroSync <span className="text-purple-600"></span></h1>
                    <h3 className="header-subtitle">Cognitive Memory Archiving System</h3>
                </header>
                <h2 className="welcome-title">Welcome Back</h2>

                {error && <div className="error-message">{error}</div>}

                <form className="login-form" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input"
                        required
                    />
                    <button
                        type="submit"
                        className={`submit-button${loading ? ' disabled' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="toggle-text">
                    Don't have an account?{' '}
                    <button className="toggle-button" onClick={onToggleForm}>Sign up</button>
                </div>
            </div>

            <div className={`scroll-content${showScrollContent ? ' visible' : ''}`}>
                <h2 className="scroll-content-title">AI Memory Augmentation App</h2>
                <p className="scroll-content-text">
                    A full-stack project designed to help you upload and manage your audio or video memories.
                </p>
                <div className="content-grid">
                    <div>
                        <h3 className="content-heading">Key Features</h3>
                        <ul className="content-list">
                            <li>Upload audio/video files with ease.</li>
                            <li>Automatic transcription using <strong>Whisper AI</strong>.</li>
                            <li>Automatic language detection and translation to &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;English.</li>
                            <li>Extraction of keyframes from videos using <strong>OpenCV</strong>.</li>
                            <li>Store all data securely in a <strong>MongoDB</strong> database.</li>
                            <li>Powerful keyword search to find memories quickly.</li>
                            <li>View and delete memories via a simple web interface.</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="content-heading">Tech Stack</h3>
                        <ul className="content-list">
                            <li><strong>Frontend:</strong> React (Vite/CRA)</li>
                            <li><strong>Backend:</strong> Flask (Python)</li>
                            <li><strong>Database:</strong> MongoDB</li>
                            <li><strong>AI Processing:</strong> OpenAI Whisper, OpenCV, Librosa</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;