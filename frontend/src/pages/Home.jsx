// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import spacesService from '../api/spaces.service'
import reservationsService from '../api/reservations.service'
import toast from 'react-hot-toast'

const Home = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [featuredSpaces, setFeaturedSpaces] = useState([])
    const [loading, setLoading] = useState(true)
    const [summary, setSummary] = useState({
        totalReservations: 0,
        activeReservations: 0,
        totalSpent: 0,
        upcomingReservations: 0
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                // ✅ Obtener espacios destacados (3 por cada tipo = 15 espacios)
                const spacesData = await spacesService.getFeatured(15)
                setFeaturedSpaces(spacesData || [])

                // ✅ Si está autenticado, obtener resumen de reservas
                if (user) {
                    try {
                        const summaryData = await reservationsService.getSummary()
                        setSummary({
                            totalReservations: summaryData?.totalReservations || 0,
                            activeReservations: summaryData?.activeReservations || 0,
                            totalSpent: summaryData?.totalSpent || 0,
                            upcomingReservations: summaryData?.upcomingReservations || 0
                        })
                    } catch (err) {
                        console.log('Reservations summary not available yet')
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error)
                toast.error('Error al cargar los espacios')

                // Datos de ejemplo para desarrollo (si falla la API)
                setFeaturedSpaces([
                    {
                        id: 1,
                        name: 'Premium Office',
                        city: 'Stockholm',
                        country: 'Sweden',
                        pricePerHour: 45,
                        averageRating: 4.8,
                        type: 'Premium Office',
                        capacity: 12,
                        imageUrls: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800']
                    },
                    {
                        id: 2,
                        name: 'Creative Space',
                        city: 'Gothenburg',
                        country: 'Sweden',
                        pricePerHour: 35,
                        averageRating: 4.5,
                        type: 'Creative Space',
                        capacity: 20,
                        imageUrls: ['https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800']
                    },
                    {
                        id: 3,
                        name: 'Meeting Room',
                        city: 'Malmö',
                        country: 'Sweden',
                        pricePerHour: 25,
                        averageRating: 4.2,
                        type: 'Meeting Room',
                        capacity: 15,
                        imageUrls: ['https://images.unsplash.com/photo-1511578314322-379afb476865?w=800']
                    },
                ])
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user])

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    // Si no está autenticado, redirigir al login
    if (!user && !loading) {
        navigate('/login')
        return null
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

                {/* Stats Cards - Solo si hay datos de reservas */}
                {summary.totalReservations > 0 && (
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
                                {summary.totalReservations}
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
                                {summary.activeReservations}
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
                                ${summary.totalSpent.toFixed(0)}
                            </div>
                            <div style={{
                                fontSize: '14px',
                                color: '#56423d',
                                fontFamily: 'Work Sans, sans-serif'
                            }}>
                                Total Spent
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
                                {summary.upcomingReservations}
                            </div>
                            <div style={{
                                fontSize: '14px',
                                color: '#56423d',
                                fontFamily: 'Work Sans, sans-serif'
                            }}>
                                Upcoming
                            </div>
                        </div>
                    </div>
                )}

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
                            fontFamily: 'Work Sans, sans-serif',
                            fontWeight: '500'
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
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} style={{
                                    backgroundColor: '#f5f3f6',
                                    height: '300px',
                                    borderRadius: '8px',
                                    animation: 'pulse 1.5s ease-in-out infinite'
                                }} />
                            ))}
                        </div>
                    ) : featuredSpaces.length === 0 ? (
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
                        <>
                            {/* Mostrar 3 tipos de espacios destacados */}
                            {['Premium Office', 'Creative Space', 'Meeting Room'].map((type) => {
                                const spacesOfType = featuredSpaces
                                    .filter(s => s.type === type)
                                    .slice(0, 3)

                                if (spacesOfType.length === 0) return null

                                return (
                                    <div key={type} style={{ marginBottom: '32px' }}>
                                        <h3 style={{
                                            fontSize: '20px',
                                            fontWeight: '600',
                                            color: '#1b1b1e',
                                            fontFamily: 'Manrope, sans-serif',
                                            marginBottom: '16px'
                                        }}>
                                            {type}
                                        </h3>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                            gap: '20px'
                                        }}>
                                            {spacesOfType.map((space) => (
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
                                                        height: '180px',
                                                        backgroundColor: '#f5f3f6',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#56423d',
                                                        fontSize: '14px',
                                                        overflow: 'hidden'
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
                                                        {space.isFeatured && (
                                                            <span style={{
                                                                position: 'absolute',
                                                                top: '12px',
                                                                left: '12px',
                                                                backgroundColor: '#a03f28',
                                                                color: '#ffffff',
                                                                padding: '4px 12px',
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                borderRadius: '4px',
                                                                fontFamily: 'Work Sans, sans-serif'
                                                            }}>
                                                                Featured
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ padding: '16px' }}>
                                                        <h3 style={{
                                                            fontSize: '18px',
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
                                                                fontSize: '18px',
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
                                                                ⭐ {space.averageRating?.toFixed(1) || 'New'} · 👥 {space.capacity}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </>
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
                            Browse All Spaces
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#56423d',
                            fontFamily: 'Work Sans, sans-serif'
                        }}>
                            {featuredSpaces.length} premium spaces available
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