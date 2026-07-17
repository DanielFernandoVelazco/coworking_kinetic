import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Home = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [spaces, setSpaces] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalReservations: 0,
        activeReservations: 0,
        totalSpent: 0
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                // ✅ Obtener espacios destacados - No requiere autenticación
                const spacesResponse = await axios.get('/api/spaces/featured?limit=3');
                setSpaces(spacesResponse.data || []);
            } catch (error) {
                console.error('Error fetching spaces:', error);
                if (error.message?.includes('conectar con el servidor')) {
                    toast.error('No se pudo conectar con el servidor. ¿El backend está corriendo?');
                } else if (error.response?.status === 401) {
                    // Si el backend todavía devuelve 401, mostrar mensaje amigable
                    toast.error('Los espacios destacados no están disponibles. Por favor, inicia sesión.');
                    // Usar datos de ejemplo para desarrollo
                    setSpaces([
                        { id: 1, name: 'Premium Office', city: 'Stockholm', country: 'Sweden', pricePerHour: 45, averageRating: 4.8 },
                        { id: 2, name: 'Creative Space', city: 'Gothenburg', country: 'Sweden', pricePerHour: 35, averageRating: 4.5 },
                        { id: 3, name: 'Meeting Room', city: 'Malmö', country: 'Sweden', pricePerHour: 25, averageRating: 4.2 },
                    ]);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#fbf8fc'
        }}>
            {/* Navbar */}
            <nav style={{
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #ddc0ba',
                padding: '16px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#a03f28',
                    fontFamily: 'Manrope, sans-serif'
                }}>
                    Kinetic Workspace
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ color: '#56423d', fontFamily: 'Work Sans, sans-serif' }}>
                        {user?.firstName} {user?.lastName}
                    </span>
                    <button
                        onClick={handleLogout}
                        style={{
                            backgroundColor: '#a03f28',
                            color: '#ffffff',
                            padding: '8px 20px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontFamily: 'Work Sans, sans-serif',
                            fontSize: '14px',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#c0573e'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#a03f28'}
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px' }}>
                {/* Hero Section */}
                <div style={{
                    background: 'linear-gradient(135deg, #a03f28 0%, #c0573e 100%)',
                    borderRadius: '12px',
                    padding: '48px',
                    marginBottom: '40px',
                    color: '#ffffff'
                }}>
                    <h1 style={{
                        fontSize: '48px',
                        fontWeight: '700',
                        fontFamily: 'Manrope, sans-serif',
                        marginBottom: '8px'
                    }}>
                        Welcome back, {user?.firstName}! 👋
                    </h1>
                    <p style={{
                        fontSize: '18px',
                        fontFamily: 'Work Sans, sans-serif',
                        opacity: 0.9
                    }}>
                        Your high-performance workspace awaits.
                    </p>
                </div>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '24px',
                    marginBottom: '40px'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        padding: '24px',
                        borderRadius: '8px',
                        border: '1px solid #ddc0ba',
                        boxShadow: '0 4px 12px rgba(147, 74, 35, 0.05)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '32px',
                            fontWeight: '700',
                            color: '#a03f28',
                            fontFamily: 'Manrope, sans-serif'
                        }}>
                            {stats.totalReservations}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#56423d',
                            fontFamily: 'Work Sans, sans-serif'
                        }}>
                            Total Bookings
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: '#ffffff',
                        padding: '24px',
                        borderRadius: '8px',
                        border: '1px solid #ddc0ba',
                        boxShadow: '0 4px 12px rgba(147, 74, 35, 0.05)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '32px',
                            fontWeight: '700',
                            color: '#a03f28',
                            fontFamily: 'Manrope, sans-serif'
                        }}>
                            {stats.activeReservations}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#56423d',
                            fontFamily: 'Work Sans, sans-serif'
                        }}>
                            Active Bookings
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: '#ffffff',
                        padding: '24px',
                        borderRadius: '8px',
                        border: '1px solid #ddc0ba',
                        boxShadow: '0 4px 12px rgba(147, 74, 35, 0.05)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '32px',
                            fontWeight: '700',
                            color: '#a03f28',
                            fontFamily: 'Manrope, sans-serif'
                        }}>
                            ${stats.totalSpent.toFixed(0)}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#56423d',
                            fontFamily: 'Work Sans, sans-serif'
                        }}>
                            Total Spent
                        </div>
                    </div>
                </div>

                {/* Featured Spaces */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <h2 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            color: '#1b1b1e',
                            fontFamily: 'Manrope, sans-serif'
                        }}>
                            Featured Spaces
                        </h2>
                        <Link to="/catalog" style={{
                            color: '#a03f28',
                            textDecoration: 'none',
                            fontFamily: 'Work Sans, sans-serif'
                        }}>
                            View All →
                        </Link>
                    </div>

                    {loading ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '24px'
                        }}>
                            {[1, 2, 3].map((i) => (
                                <div key={i} style={{
                                    backgroundColor: '#f5f3f6',
                                    height: '250px',
                                    borderRadius: '8px',
                                    animation: 'pulse 1.5s ease-in-out infinite'
                                }} />
                            ))}
                        </div>
                    ) : spaces.length === 0 ? (
                        <div style={{
                            backgroundColor: '#ffffff',
                            padding: '40px',
                            borderRadius: '8px',
                            border: '1px solid #ddc0ba',
                            textAlign: 'center',
                            color: '#56423d'
                        }}>
                            <p style={{ fontSize: '18px' }}>No featured spaces available yet.</p>
                            <p style={{ fontSize: '14px' }}>Check back later!</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '24px'
                        }}>
                            {spaces.map((space) => (
                                <Link
                                    key={space.id}
                                    to={`/spaces/${space.id}`}
                                    style={{
                                        textDecoration: 'none',
                                        backgroundColor: '#ffffff',
                                        borderRadius: '8px',
                                        border: '1px solid #ddc0ba',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s',
                                        boxShadow: '0 4px 12px rgba(147, 74, 35, 0.05)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)'
                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(147, 74, 35, 0.15)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)'
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(147, 74, 35, 0.05)'
                                    }}
                                >
                                    <div style={{
                                        height: '200px',
                                        backgroundColor: '#f5f3f6',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#56423d',
                                        fontSize: '14px'
                                    }}>
                                        {space.imageUrls?.[0] ? (
                                            <img
                                                src={space.imageUrls[0]}
                                                alt={space.name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        ) : (
                                            '📸 Space Image'
                                        )}
                                    </div>
                                    <div style={{ padding: '20px' }}>
                                        <h3 style={{
                                            fontSize: '20px',
                                            fontWeight: '600',
                                            color: '#1b1b1e',
                                            fontFamily: 'Manrope, sans-serif',
                                            marginBottom: '4px'
                                        }}>
                                            {space.name}
                                        </h3>
                                        <p style={{
                                            fontSize: '14px',
                                            color: '#56423d',
                                            fontFamily: 'Work Sans, sans-serif'
                                        }}>
                                            {space.city}, {space.country}
                                        </p>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginTop: '12px'
                                        }}>
                                            <span style={{
                                                fontSize: '20px',
                                                fontWeight: '700',
                                                color: '#a03f28',
                                                fontFamily: 'Manrope, sans-serif'
                                            }}>
                                                ${space.pricePerHour}
                                                <span style={{
                                                    fontSize: '14px',
                                                    fontWeight: '400',
                                                    color: '#56423d'
                                                }}>
                                                    /hr
                                                </span>
                                            </span>
                                            <span style={{
                                                fontSize: '14px',
                                                color: '#56423d',
                                                fontFamily: 'Work Sans, sans-serif'
                                            }}>
                                                ⭐ {space.averageRating?.toFixed(1) || 'New'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '24px'
                }}>
                    <Link to="/catalog" style={{
                        textDecoration: 'none',
                        backgroundColor: '#ffffff',
                        padding: '24px',
                        borderRadius: '8px',
                        border: '1px solid #ddc0ba',
                        textAlign: 'center',
                        transition: 'all 0.3s',
                        boxShadow: '0 4px 12px rgba(147, 74, 35, 0.05)'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(147, 74, 35, 0.12)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(147, 74, 35, 0.05)'
                        }}
                    >
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏢</div>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1b1b1e',
                            fontFamily: 'Manrope, sans-serif'
                        }}>
                            Browse Spaces
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#56423d',
                            fontFamily: 'Work Sans, sans-serif'
                        }}>
                            Find your perfect workspace
                        </div>
                    </Link>

                    <Link to="/profile" style={{
                        textDecoration: 'none',
                        backgroundColor: '#ffffff',
                        padding: '24px',
                        borderRadius: '8px',
                        border: '1px solid #ddc0ba',
                        textAlign: 'center',
                        transition: 'all 0.3s',
                        boxShadow: '0 4px 12px rgba(147, 74, 35, 0.05)'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(147, 74, 35, 0.12)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(147, 74, 35, 0.05)'
                        }}
                    >
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>👤</div>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1b1b1e',
                            fontFamily: 'Manrope, sans-serif'
                        }}>
                            My Profile
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#56423d',
                            fontFamily: 'Work Sans, sans-serif'
                        }}>
                            View and edit your profile
                        </div>
                    </Link>

                    <Link to="/reservations" style={{
                        textDecoration: 'none',
                        backgroundColor: '#ffffff',
                        padding: '24px',
                        borderRadius: '8px',
                        border: '1px solid #ddc0ba',
                        textAlign: 'center',
                        transition: 'all 0.3s',
                        boxShadow: '0 4px 12px rgba(147, 74, 35, 0.05)'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(147, 74, 35, 0.12)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(147, 74, 35, 0.05)'
                        }}
                    >
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1b1b1e',
                            fontFamily: 'Manrope, sans-serif'
                        }}>
                            My Reservations
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#56423d',
                            fontFamily: 'Work Sans, sans-serif'
                        }}>
                            View your booking history
                        </div>
                    </Link>
                </div>
            </div>

            {/* Animación de pulse para loading */}
            <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
        </div>
    )
}

export default Home