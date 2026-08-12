// frontend/src/pages/Catalog.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import spacesService from '../api/spaces.service';
import toast from 'react-hot-toast';

const SPACE_TYPES = [
    'Premium Office',
    'Meeting Room',
    'Dedicated Desk',
    'Focus Pod',
    'Creative Space'
];

const Catalog = () => {
    const [spaces, setSpaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        city: '',
        type: ''
    });
    const [cities, setCities] = useState([]);

    useEffect(() => {
        fetchSpaces();
    }, [filters]);

    const fetchSpaces = async () => {
        setLoading(true);
        try {
            let data;
            if (filters.search) {
                data = await spacesService.search(filters.search, filters.city || null, filters.type || null);
            } else if (filters.city) {
                data = await spacesService.getByCity(filters.city);
            } else if (filters.type) {
                // Si hay filtro de tipo pero no búsqueda, obtenemos todos y filtramos localmente
                data = await spacesService.getAll();
                data = data.filter(s => s.type === filters.type);
            } else {
                data = await spacesService.getAll();
            }

            // Asegurar que data sea un array
            setSpaces(Array.isArray(data) ? data : []);

            // Extraer ciudades únicas para el filtro
            if (Array.isArray(data)) {
                const uniqueCities = [...new Set(data.map(s => s.city).filter(Boolean))];
                setCities(uniqueCities);
            }
        } catch (error) {
            console.error('Error fetching spaces:', error);
            toast.error('Error al cargar los espacios');
            setSpaces([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            city: '',
            type: ''
        });
    };

    const getTypeCount = (type) => {
        return spaces.filter(s => s.type === type).length;
    };

    return (
        <div className="max-w-container-max mx-auto px-margin-desktop py-12">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Available Workspaces</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                        {loading ? 'Loading...' : `Showing ${spaces.length} premium spaces across Sweden`}
                    </p>
                </div>
                <button
                    onClick={clearFilters}
                    className="text-primary hover:underline font-body-sm"
                >
                    Clear Filters
                </button>
            </div>

            {/* Filtros */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
                            SEARCH
                        </label>
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Search spaces..."
                            className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
                            CITY
                        </label>
                        <select
                            name="city"
                            value={filters.city}
                            onChange={handleFilterChange}
                            className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                        >
                            <option value="">All Cities</option>
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
                            SPACE TYPE
                        </label>
                        <select
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                        >
                            <option value="">All Types ({spaces.length})</option>
                            {SPACE_TYPES.map(type => (
                                <option key={type} value={type}>
                                    {type} ({getTypeCount(type)})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <div className="text-body-sm text-on-surface-variant">
                            <span className="material-symbols-outlined align-middle mr-1">info</span>
                            {filters.search || filters.city || filters.type ? 'Filters active' : 'Showing all spaces'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de espacios */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-surface-container-low rounded-xl h-80 animate-pulse"></div>
                    ))}
                </div>
            ) : spaces.length === 0 ? (
                <div className="text-center py-20 text-on-surface-variant">
                    <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
                    <h3 className="font-headline-md text-headline-md mb-2">No spaces found</h3>
                    <p>Try adjusting your filters or search terms</p>
                    <button
                        onClick={clearFilters}
                        className="mt-4 text-primary hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                    {spaces.map((space) => (
                        <Link
                            key={space.id}
                            to={`/spaces/${space.id}`}
                            className="group bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant hover:shadow-xl transition-all duration-300"
                        >
                            <div className="h-56 bg-surface-container relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant">
                                    {space.imageUrls?.[0] ? (
                                        <img
                                            src={space.imageUrls[0]}
                                            alt={space.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = '<span class="material-symbols-outlined text-6xl">meeting_room</span>';
                                            }}
                                        />
                                    ) : (
                                        <span className="material-symbols-outlined text-6xl">meeting_room</span>
                                    )}
                                </div>
                                {space.isFeatured && (
                                    <span className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 font-label-caps text-label-caps rounded-full">
                                        Featured
                                    </span>
                                )}
                                <span className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 font-label-caps text-label-caps rounded-full text-xs">
                                    Available
                                </span>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                                            {space.name}
                                        </h3>
                                        <span className="text-body-sm text-on-surface-variant">
                                            {space.type}
                                        </span>
                                    </div>
                                    <span className="font-headline-md text-primary whitespace-nowrap">
                                        ${space.pricePerHour}
                                        <span className="text-body-sm text-on-surface-variant font-body-sm"> /hr</span>
                                    </span>
                                </div>
                                <p className="text-body-sm text-on-surface-variant mb-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    {space.city}, {space.country}
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className="text-body-sm text-on-surface-variant">
                                        👥 {space.capacity} people
                                    </span>
                                    <span className="text-body-sm text-on-surface-variant">
                                        ⭐ {space.averageRating?.toFixed(1) || 'New'}
                                    </span>
                                </div>
                                {space.amenities?.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {space.amenities.slice(0, 3).map((amenity, index) => (
                                            <span key={index} className="text-xs bg-surface-container-low px-2 py-1 rounded-full text-on-surface-variant">
                                                {amenity}
                                            </span>
                                        ))}
                                        {space.amenities.length > 3 && (
                                            <span className="text-xs text-on-surface-variant">+{space.amenities.length - 3}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Footer con contador */}
            {!loading && spaces.length > 0 && (
                <div className="mt-8 text-center text-body-sm text-on-surface-variant">
                    Showing {spaces.length} {spaces.length === 1 ? 'space' : 'spaces'}
                    {filters.type && ` of type "${filters.type}"`}
                    {filters.city && ` in ${filters.city}`}
                    {filters.search && ` matching "${filters.search}"`}
                </div>
            )}
        </div>
    );
};

export default Catalog;