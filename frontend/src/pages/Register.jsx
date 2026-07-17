import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Register = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        company: ''
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // Validar que las contraseñas coincidan
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden')
            setLoading(false)
            return
        }

        // Validar longitud de contraseña
        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            setLoading(false)
            return
        }

        try {
            const { confirmPassword, ...userData } = formData
            const response = await axios.post('/api/auth/register', userData)

            if (response.data) {
                // Si el registro es exitoso, redirigir al login
                navigate('/login', { state: { message: 'Registro exitoso. Ahora puedes iniciar sesión.' } })
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Error al registrar usuario'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fbf8fc',
            padding: '20px 16px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '480px',
                backgroundColor: '#ffffff',
                border: '1px solid #ddc0ba',
                padding: '40px',
                boxShadow: '0 4px 12px rgba(147, 74, 35, 0.05)',
                borderRadius: '4px',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{
                        fontSize: '36px',
                        fontWeight: '700',
                        color: '#1b1b1e',
                        marginBottom: '8px',
                        fontFamily: 'Manrope, sans-serif',
                        lineHeight: '44px',
                        letterSpacing: '-0.01em'
                    }}>
                        Create Account
                    </h1>
                    <p style={{
                        fontSize: '16px',
                        color: '#56423d',
                        fontFamily: 'Work Sans, sans-serif',
                        lineHeight: '24px'
                    }}>
                        Join the Kinetic Workspace community
                    </p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#ffdad6',
                        color: '#ba1a1a',
                        padding: '12px',
                        borderRadius: '4px',
                        marginBottom: '16px',
                        fontSize: '14px',
                        fontFamily: 'Work Sans, sans-serif'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                fontSize: '12px',
                                fontFamily: 'JetBrains Mono, monospace',
                                letterSpacing: '0.05em',
                                color: '#56423d',
                                display: 'block',
                                marginBottom: '4px'
                            }}>
                                FIRST NAME
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="John"
                                required
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

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                fontSize: '12px',
                                fontFamily: 'JetBrains Mono, monospace',
                                letterSpacing: '0.05em',
                                color: '#56423d',
                                display: 'block',
                                marginBottom: '4px'
                            }}>
                                LAST NAME
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Doe"
                                required
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
                    </div>

                    <div style={{ marginBottom: '16px' }}>
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
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@kinetic.com"
                            required
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

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            fontSize: '12px',
                            fontFamily: 'JetBrains Mono, monospace',
                            letterSpacing: '0.05em',
                            color: '#56423d',
                            display: 'block',
                            marginBottom: '4px'
                        }}>
                            PASSWORD
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
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

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            fontSize: '12px',
                            fontFamily: 'JetBrains Mono, monospace',
                            letterSpacing: '0.05em',
                            color: '#56423d',
                            display: 'block',
                            marginBottom: '4px'
                        }}>
                            CONFIRM PASSWORD
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
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

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            fontSize: '12px',
                            fontFamily: 'JetBrains Mono, monospace',
                            letterSpacing: '0.05em',
                            color: '#56423d',
                            display: 'block',
                            marginBottom: '4px'
                        }}>
                            COMPANY (Optional)
                        </label>
                        <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Your Company"
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

                    <button
                        type="submit"
                        disabled={loading}
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
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s',
                            opacity: loading ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) e.target.style.backgroundColor = '#c0573e'
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) e.target.style.backgroundColor = '#a03f28'
                        }}
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p style={{
                    marginTop: '24px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontFamily: 'Work Sans, sans-serif',
                    color: '#56423d'
                }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#a03f28', fontWeight: 'bold', textDecoration: 'none' }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Register