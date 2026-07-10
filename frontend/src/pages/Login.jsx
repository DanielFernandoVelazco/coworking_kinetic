import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Login attempt:', { email, password })
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fbf8fc',
            padding: '0 16px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '480px',
                backgroundColor: '#ffffff',
                border: '1px solid #ddc0ba',
                padding: '40px',
                boxShadow: '0 4px 12px rgba(147, 74, 35, 0.05)',
                borderRadius: '4px'
            }}>
                {/* Header */}
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{
                        fontSize: '36px',
                        fontWeight: '700',
                        color: '#1b1b1e',
                        marginBottom: '8px',
                        fontFamily: 'Manrope, sans-serif',
                        lineHeight: '44px',
                        letterSpacing: '-0.01em'
                    }}>
                        Welcome back
                    </h1>
                    <p style={{
                        fontSize: '16px',
                        color: '#56423d',
                        fontFamily: 'Work Sans, sans-serif',
                        lineHeight: '24px'
                    }}>
                        Access your high-performance workspace.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            fontSize: '12px',
                            fontFamily: 'JetBrains Mono, monospace',
                            letterSpacing: '0.05em',
                            color: '#56423d',
                            display: 'block',
                            marginBottom: '4px'
                        }}>
                            EMAIL ADDRESS
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="executive@kinetic.com"
                            style={{
                                width: '100%',
                                backgroundColor: '#f5f3f6',
                                border: 'none',
                                borderBottom: '1px solid #ddc0ba',
                                padding: '12px 0',
                                color: '#1b1b1e',
                                transition: 'all 0.3s',
                                outline: 'none',
                                fontFamily: 'Work Sans, sans-serif',
                                fontSize: '16px'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderBottomColor = '#a03f28'
                                e.target.style.backgroundColor = '#ffffff'
                            }}
                            onBlur={(e) => {
                                e.target.style.borderBottomColor = '#ddc0ba'
                                e.target.style.backgroundColor = '#f5f3f6'
                            }}
                        />
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <label style={{
                                fontSize: '12px',
                                fontFamily: 'JetBrains Mono, monospace',
                                letterSpacing: '0.05em',
                                color: '#56423d',
                                display: 'block'
                            }}>
                                PASSWORD
                            </label>
                            <Link to="/forgot-password" style={{
                                fontSize: '14px',
                                color: '#a03f28',
                                fontFamily: 'Work Sans, sans-serif',
                                textDecoration: 'none'
                            }}>
                                Forgot?
                            </Link>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{
                                width: '100%',
                                backgroundColor: '#f5f3f6',
                                border: 'none',
                                borderBottom: '1px solid #ddc0ba',
                                padding: '12px 0',
                                color: '#1b1b1e',
                                transition: 'all 0.3s',
                                outline: 'none',
                                fontFamily: 'Work Sans, sans-serif',
                                fontSize: '16px'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderBottomColor = '#a03f28'
                                e.target.style.backgroundColor = '#ffffff'
                            }}
                            onBlur={(e) => {
                                e.target.style.borderBottomColor = '#ddc0ba'
                                e.target.style.backgroundColor = '#f5f3f6'
                            }}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            backgroundColor: '#a03f28',
                            color: '#ffffff',
                            padding: '16px 0',
                            fontSize: '24px',
                            fontFamily: 'Manrope, sans-serif',
                            fontWeight: '600',
                            border: 'none',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#c0573e'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#a03f28'}
                    >
                        Sign In
                    </button>
                </form>

                {/* Divider */}
                <div style={{ position: 'relative', margin: '40px 0' }}>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '100%', borderTop: '1px solid #ddc0ba' }}></div>
                    </div>
                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                        <span style={{
                            backgroundColor: '#ffffff',
                            padding: '0 16px',
                            fontSize: '12px',
                            fontFamily: 'JetBrains Mono, monospace',
                            letterSpacing: '0.05em',
                            color: '#56423d'
                        }}>
                            OR CONTINUE WITH
                        </span>
                    </div>
                </div>

                {/* Social Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        border: '1px solid #ddc0ba',
                        padding: '12px 16px',
                        backgroundColor: 'transparent',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontFamily: 'Work Sans, sans-serif',
                        fontSize: '14px',
                        transition: 'all 0.3s'
                    }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f3f6'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        <span style={{ color: '#a03f28' }}>G</span>
                        Google
                    </button>
                    <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        border: '1px solid #ddc0ba',
                        padding: '12px 16px',
                        backgroundColor: 'transparent',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontFamily: 'Work Sans, sans-serif',
                        fontSize: '14px',
                        transition: 'all 0.3s'
                    }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f3f6'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        <span style={{ color: '#a03f28' }}>W</span>
                        SSO
                    </button>
                </div>

                {/* Register Link */}
                <p style={{
                    marginTop: '40px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontFamily: 'Work Sans, sans-serif',
                    color: '#56423d'
                }}>
                    New to Kinetic?{' '}
                    <Link to="/register" style={{ color: '#a03f28', fontWeight: 'bold', textDecoration: 'none' }}>
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Login