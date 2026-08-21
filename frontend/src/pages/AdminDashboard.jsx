// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import adminService from '../api/admin.service';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Area,
    ComposedChart
} from 'recharts';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState(12);
    const [refreshing, setRefreshing] = useState(false);

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminService.getDashboard();
            setDashboardData(data);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            toast.error('Error al cargar el dashboard');
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshData = useCallback(async () => {
        setRefreshing(true);
        await loadDashboard();
        setRefreshing(false);
        toast.success('Dashboard actualizado');
    }, [loadDashboard]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const handleExportReport = useCallback(async () => {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);

            const blob = await adminService.exportReport(startDate, endDate);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Reporte_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Reporte exportado exitosamente');
        } catch (error) {
            console.error('Error exporting report:', error);
            toast.error('Error al exportar reporte');
        }
    }, []);

    if (loading) {
        return (
            <div className="max-w-container-max mx-auto px-margin-desktop py-12">
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-on-surface-variant mt-4">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="max-w-container-max mx-auto px-margin-desktop py-12">
                <div className="text-center py-20">
                    <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">error</span>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">No se pudieron cargar los datos</h2>
                    <button
                        onClick={refreshData}
                        className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-secondary transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    const { summary, monthlyReservations, monthlyRevenue, recentReservations, topUsers, topSpaces, spaceStatus, systemHealth, reservationStatusDistribution, spaceTypeDistribution } = dashboardData;

    const COLORS = ['#8b5cf6', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#6b7280'];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            'Confirmed': 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
            'Pending': 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
            'Completed': 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
            'Cancelled': 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
        };
        return colors[status] || 'text-gray-600 bg-gray-100';
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant shadow-lg">
                    <p className="font-body-sm font-semibold text-on-surface">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-body-sm text-on-surface-variant">
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // ✅ Custom Tooltip para gráficos de pastel
    const PieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant shadow-lg">
                    <p className="font-body-sm font-semibold text-on-surface">{data.name || data.Status || data.Type || data.status}</p>
                    <p className="text-body-sm text-on-surface-variant">
                        {data.count || data.value} items ({data.percentage || ((data.count / data.total) * 100).toFixed(1)}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    // ✅ Función para formatear datos de pastel con porcentaje
    const formatPieData = (data) => {
        if (!data || data.length === 0) return [];
        const total = data.reduce((sum, item) => sum + (item.count || 0), 0);
        return data.map(item => ({
            ...item,
            name: item.Status || item.status || item.Type || item.type || 'Unknown',
            value: item.count || 0,
            total: total,
            percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : 0
        }));
    };

    // ✅ Render personalizado para etiquetas de pastel (solo porcentaje)
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="#fff"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="text-xs font-medium"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    // ✅ Render personalizado para leyenda (con colores y counts)
    const renderLegend = (props) => {
        const { payload } = props;
        return (
            <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-xs">
                {payload.map((entry, index) => (
                    <li key={`item-${index}`} className="flex items-center gap-1.5">
                        <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-on-surface-variant">
                            {entry.value}: {entry.payload?.count || 0}
                        </span>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="max-w-container-max mx-auto px-margin-desktop py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-4xl">dashboard</span>
                        Admin Dashboard
                    </h1>
                    <p className="text-body-md text-on-surface-variant">
                        Welcome back, {user?.firstName}! Here's what's happening with your workspace.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={refreshData}
                        disabled={refreshing}
                        className="px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-2"
                    >
                        <span className={`material-symbols-outlined text-sm ${refreshing ? 'animate-spin' : ''}`}>
                            refresh
                        </span>
                        Refresh
                    </button>
                    <button
                        onClick={handleExportReport}
                        className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">download</span>
                        Export Report
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant text-center">
                    <div className="text-body-xs text-on-surface-variant uppercase tracking-wider">Usuarios</div>
                    <div className="font-headline-lg text-primary mt-1">{summary.totalUsers}</div>
                    <div className="text-body-xs text-on-surface-variant">+{summary.newUsersThisMonth} este mes</div>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant text-center">
                    <div className="text-body-xs text-on-surface-variant uppercase tracking-wider">Espacios</div>
                    <div className="font-headline-lg text-primary mt-1">{summary.totalSpaces}</div>
                    <div className="text-body-xs text-on-surface-variant">{summary.availableSpaces} disponibles</div>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant text-center">
                    <div className="text-body-xs text-on-surface-variant uppercase tracking-wider">Reservas</div>
                    <div className="font-headline-lg text-primary mt-1">{summary.totalReservations}</div>
                    <div className="text-body-xs text-on-surface-variant">{summary.activeReservations} activas</div>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant text-center">
                    <div className="text-body-xs text-on-surface-variant uppercase tracking-wider">Ocupación</div>
                    <div className="font-headline-lg text-primary mt-1">{summary.occupancyRate}%</div>
                    <div className="text-body-xs text-on-surface-variant">de espacios ocupados</div>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant text-center">
                    <div className="text-body-xs text-on-surface-variant uppercase tracking-wider">Ingresos</div>
                    <div className="font-headline-lg text-primary mt-1">{formatCurrency(summary.totalRevenue)}</div>
                    <div className="text-body-xs text-on-surface-variant">{formatCurrency(summary.monthlyRevenue)} este mes</div>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant text-center">
                    <div className="text-body-xs text-on-surface-variant uppercase tracking-wider">Promedio</div>
                    <div className="font-headline-lg text-primary mt-1">{formatCurrency(summary.averageRevenuePerBooking)}</div>
                    <div className="text-body-xs text-on-surface-variant">por reserva</div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Monthly Reservations */}
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-headline-md text-headline-md">Reservas Mensuales</h3>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                            className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                        >
                            <option value={6}>6 meses</option>
                            <option value={12}>12 meses</option>
                            <option value={24}>24 meses</option>
                        </select>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyReservations}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ddc0ba" opacity={0.3} />
                                <XAxis dataKey="month" stroke="#56423d" fontSize={12} tickLine={false} />
                                <YAxis stroke="#56423d" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" fill="#a03f28" radius={[4, 4, 0, 0]} name="Reservas" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Monthly Revenue */}
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-headline-md text-headline-md">Ingresos Mensuales</h3>
                        <span className="text-body-sm text-on-surface-variant">{formatCurrency(monthlyRevenue[monthlyRevenue.length - 1]?.amount || 0)} último mes</span>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ddc0ba" opacity={0.3} />
                                <XAxis dataKey="month" stroke="#56423d" fontSize={12} tickLine={false} />
                                <YAxis stroke="#56423d" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="amount" stroke="#c0573e" strokeWidth={3} name="Ingresos ($)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Area type="monotone" dataKey="amount" fill="#c0573e" fillOpacity={0.1} stroke="none" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ✅ Distribution Charts - CORREGIDOS con mejor leyenda */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Space Status Distribution */}
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                    <h3 className="font-headline-md text-headline-md mb-4 text-center">Estado de Espacios</h3>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={formatPieData(spaceStatus)}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="value"
                                    nameKey="name"
                                    label={renderCustomLabel}
                                    labelLine={false}
                                >
                                    {formatPieData(spaceStatus).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<PieTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* ✅ Leyenda personalizada en grid */}
                    <div className="mt-3 pt-3 border-t border-outline-variant">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-body-xs">
                            {formatPieData(spaceStatus).map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
                                    />
                                    <span className="text-on-surface-variant truncate">
                                        {item.name}: <strong>{item.count}</strong>
                                        <span className="text-on-surface-variant/60"> ({item.percentage}%)</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Reservation Status Distribution */}
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                    <h3 className="font-headline-md text-headline-md mb-4 text-center">Estado de Reservas</h3>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={formatPieData(reservationStatusDistribution)}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="value"
                                    nameKey="name"
                                    label={renderCustomLabel}
                                    labelLine={false}
                                >
                                    {formatPieData(reservationStatusDistribution).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<PieTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-3 pt-3 border-t border-outline-variant">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-body-xs">
                            {formatPieData(reservationStatusDistribution).map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
                                    />
                                    <span className="text-on-surface-variant truncate">
                                        {item.name}: <strong>{item.count}</strong>
                                        <span className="text-on-surface-variant/60"> ({item.percentage}%)</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Space Type Distribution */}
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                    <h3 className="font-headline-md text-headline-md mb-4 text-center">Tipos de Espacios</h3>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={formatPieData(spaceTypeDistribution)}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="value"
                                    nameKey="name"
                                    label={renderCustomLabel}
                                    labelLine={false}
                                >
                                    {formatPieData(spaceTypeDistribution).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<PieTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* ✅ Leyenda en grid de 2 columnas para tipos de espacios */}
                    <div className="mt-3 pt-3 border-t border-outline-variant">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-body-xs">
                            {formatPieData(spaceTypeDistribution).map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
                                    />
                                    <span className="text-on-surface-variant truncate">
                                        {item.name}: <strong>{item.count}</strong>
                                        <span className="text-on-surface-variant/60"> ({item.percentage}%)</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Reservations & Top Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Recent Reservations */}
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-headline-md text-headline-md">Reservas Recientes</h3>
                        <Link to="/reservations" className="text-primary hover:underline text-sm">
                            Ver todas →
                        </Link>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {recentReservations.length === 0 ? (
                            <p className="text-body-sm text-on-surface-variant text-center py-8">No hay reservas recientes</p>
                        ) : (
                            recentReservations.map((reservation) => (
                                <div key={reservation.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant hover:shadow-md transition-shadow">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-body-sm font-semibold text-on-surface truncate">{reservation.spaceName}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                                                {reservation.status}
                                            </span>
                                        </div>
                                        <p className="text-body-xs text-on-surface-variant truncate">
                                            {reservation.userName} • {formatDate(reservation.createdAt)}
                                        </p>
                                    </div>
                                    <span className="font-headline-sm text-primary ml-4">
                                        ${reservation.totalPrice.toFixed(2)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Top Users */}
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                    <h3 className="font-headline-md text-headline-md mb-4">Top Usuarios</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {topUsers.length === 0 ? (
                            <p className="text-body-sm text-on-surface-variant text-center py-8">No hay datos de usuarios</p>
                        ) : (
                            topUsers.map((user, index) => (
                                <div key={user.userId} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-body-sm font-semibold text-on-surface truncate">{user.userName}</p>
                                            <p className="text-body-xs text-on-surface-variant truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-4">
                                        <p className="font-body-sm font-semibold text-primary">{user.totalReservations} reservas</p>
                                        <p className="text-body-xs text-on-surface-variant">${user.totalSpent.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Top Spaces & System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Spaces */}
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                    <h3 className="font-headline-md text-headline-md mb-4">Top Espacios</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {topSpaces.length === 0 ? (
                            <p className="text-body-sm text-on-surface-variant text-center py-8">No hay datos de espacios</p>
                        ) : (
                            topSpaces.map((space, index) => (
                                <div key={space.spaceId} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-body-sm font-semibold text-on-surface truncate">{space.spaceName}</span>
                                            <span className="text-body-xs text-on-surface-variant">({space.spaceType})</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-body-xs text-on-surface-variant">
                                            <span>⭐ {space.averageRating.toFixed(1)}</span>
                                            <span>🕐 {space.totalHoursBooked}h</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-4">
                                        <p className="font-body-sm font-semibold text-primary">{space.totalReservations} reservas</p>
                                        <p className="text-body-xs text-on-surface-variant">${space.totalRevenue.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* System Health */}
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                    <h3 className="font-headline-md text-headline-md mb-4">Estado del Sistema</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                            <span className="text-body-sm text-on-surface">Estado</span>
                            <span className={`font-semibold ${systemHealth.status === 'Healthy' ? 'text-emerald-600' : 'text-red-600'}`}>
                                <span className="material-symbols-outlined text-sm align-middle mr-1">
                                    {systemHealth.status === 'Healthy' ? 'check_circle' : 'error'}
                                </span>
                                {systemHealth.status}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                            <span className="text-body-sm text-on-surface">Base de Datos</span>
                            <span className={`font-semibold ${systemHealth.databaseOk ? 'text-emerald-600' : 'text-red-600'}`}>
                                {systemHealth.databaseOk ? '✅ Conectada' : '❌ Desconectada'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                            <span className="text-body-sm text-on-surface">API</span>
                            <span className={`font-semibold ${systemHealth.apiOk ? 'text-emerald-600' : 'text-red-600'}`}>
                                {systemHealth.apiOk ? '✅ Funcionando' : '❌ Error'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                            <span className="text-body-sm text-on-surface">Tiempo Activo</span>
                            <span className="font-semibold text-on-surface">{systemHealth.uptimeDays} días</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                            <span className="text-body-sm text-on-surface">Última Verificación</span>
                            <span className="text-body-sm text-on-surface-variant">
                                {new Date(systemHealth.lastCheck).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;