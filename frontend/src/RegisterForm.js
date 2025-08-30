import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { registerUser } from './api';

const RegisterForm = ({ onToggleForm }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            window.location.reload();
        }
    }, [isAuthenticated]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const response = await registerUser(formData.email, formData.password, formData.name);
            setSuccess(true);
            
            // Show success message for 2 seconds before logging in and refreshing
            setTimeout(() => {
                login(response.user, response.access_token);
            }, 2000);
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{
                maxWidth: 400,
                margin: '3rem auto',
                padding: '2.5rem',
                background: '#111827',
                borderRadius: '1.5rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid #1f2937',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5rem',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    color: 'white'
                }}>
                    ✓
                </div>
                <h2 style={{
                    color: '#10b981',
                    fontSize: '1.8rem',
                    fontWeight: 700
                }}>Registration Successful!</h2>
                <p style={{ color: '#9ca3af' }}>
                    Your account has been created. You will be redirected to the dashboard shortly.
                </p>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: 400,
            margin: '3rem auto',
            padding: '2.5rem',
            background: '#111827',
            borderRadius: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #1f2937',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        }}>
            <h2 style={{
                textAlign: 'center',
                color: '#a855f7',
                marginBottom: '1.5rem',
                fontSize: '1.8rem',
                fontWeight: 700,
                letterSpacing: '0.05em'
            }}>Create Account</h2>

            {error && (
                <div style={{
                    color: '#fca5a5',
                    textAlign: 'center',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#450a0a',
                    borderRadius: '0.5rem',
                    border: '1px solid #b91c1c'
                }}>
                    {error}
                </div>
            )}

            <form style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
            }} onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    style={{
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.75rem',
                        border: '1px solid #374151',
                        backgroundColor: '#1f2937',
                        color: '#d1d5db',
                        fontSize: '1rem'
                    }}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    style={{
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.75rem',
                        border: '1px solid #374151',
                        backgroundColor: '#1f2937',
                        color: '#d1d5db',
                        fontSize: '1rem'
                    }}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    style={{
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.75rem',
                        border: '1px solid #374151',
                        backgroundColor: '#1f2937',
                        color: '#d1d5db',
                        fontSize: '1rem'
                    }}
                    required
                />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={{
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.75rem',
                        border: '1px solid #374151',
                        backgroundColor: '#1f2937',
                        color: '#d1d5db',
                        fontSize: '1rem'
                    }}
                    required
                />
                <button
                    type="submit"
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#9333ea',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0.75rem',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                    }}
                    disabled={loading}
                >
                    {loading ? 'Creating account...' : 'Sign Up'}
                </button>
            </form>

            <div style={{
                textAlign: 'center',
                color: '#9ca3af',
                marginTop: '1rem'
            }}>
                Already have an account?{' '}
                <button
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#c084fc',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontWeight: 500
                    }}
                    onClick={onToggleForm}
                >
                    Sign in
                </button>
            </div>
        </div>
    );
};

export default RegisterForm;