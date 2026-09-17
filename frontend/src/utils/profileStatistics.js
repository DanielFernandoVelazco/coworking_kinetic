// frontend/src/utils/profileStatistics.js

/**
 * Calcula el histórico de reservas para los últimos N meses.
 * Devuelve un array con { month, bookings, spending, hours, averagePerBooking }.
 */
export const calculateMonthlyHistory = (reservations, monthsBack = 6) => {
    const result = [];
    const now = new Date();

    for (let i = monthsBack - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });

        const monthReservations = reservations.filter((r) => {
            const rDate = new Date(r.startTime);
            return (
                rDate.getMonth() === date.getMonth() &&
                rDate.getFullYear() === date.getFullYear() &&
                r.status !== 'Cancelled'
            );
        });

        const totalSpent = monthReservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
        const totalHours = monthReservations.reduce((sum, r) => {
            const hours = (new Date(r.endTime) - new Date(r.startTime)) / (1000 * 60 * 60);
            return sum + hours;
        }, 0);

        result.push({
            month: monthName,
            bookings: monthReservations.length,
            spending: Math.round(totalSpent),
            hours: Math.round(totalHours),
            averagePerBooking:
                monthReservations.length > 0
                    ? Math.round(totalSpent / monthReservations.length)
                    : 0,
        });
    }

    return result;
};

/**
 * Calcula estadísticas generales del usuario a partir de sus reservas.
 * Devuelve { totalBookings, totalHours, totalSpent, averagePerBooking,
 *           favoriteSpaceType, mostBookedMonth, bestMonth, monthlyAverage, trend }.
 */
export const calculateStatistics = (reservations, history) => {
    const activeReservations = reservations.filter((r) => r.status !== 'Cancelled');
    const totalBookings = activeReservations.length;

    const totalHours = activeReservations.reduce((sum, r) => {
        const hours = (new Date(r.endTime) - new Date(r.startTime)) / (1000 * 60 * 60);
        return sum + hours;
    }, 0);

    const totalSpent = activeReservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    const averagePerBooking = totalBookings > 0 ? totalSpent / totalBookings : 0;

    // Espacio favorito
    const spaceTypes = {};
    activeReservations.forEach((r) => {
        spaceTypes[r.spaceType] = (spaceTypes[r.spaceType] || 0) + 1;
    });

    let favoriteSpaceType = '';
    let maxCount = 0;
    Object.entries(spaceTypes).forEach(([type, count]) => {
        if (count > maxCount) {
            maxCount = count;
            favoriteSpaceType = type;
        }
    });

    // Mejor mes
    let bestMonth = { month: '', count: 0, spent: 0 };
    history.forEach((h) => {
        if (h.bookings > bestMonth.count) {
            bestMonth = { month: h.month, count: h.bookings, spent: h.spending };
        }
    });

    // Tendencia (últimos 3 meses vs los 3 anteriores)
    const last3 = history.slice(-3).reduce((sum, h) => sum + h.bookings, 0);
    const prev3 = history.slice(0, 3).reduce((sum, h) => sum + h.bookings, 0);

    let trend = 'stable';
    if (last3 > prev3 * 1.2) trend = 'up';
    else if (last3 < prev3 * 0.8) trend = 'down';

    // Promedio mensual
    const monthlyAverage =
        history.length > 0
            ? history.reduce((sum, h) => sum + h.bookings, 0) / history.length
            : 0;

    return {
        totalBookings,
        totalHours: Math.round(totalHours),
        totalSpent: Math.round(totalSpent),
        averagePerBooking: Math.round(averagePerBooking),
        favoriteSpaceType,
        mostBookedMonth: bestMonth.month,
        bestMonth,
        monthlyAverage: Math.round(monthlyAverage * 10) / 10,
        trend,
    };
};

export default { calculateMonthlyHistory, calculateStatistics };