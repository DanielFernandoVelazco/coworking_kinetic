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

const PAGE_SIZE = 12;

const Catalog = () => {
    const [allSpaces, setAllSpaces] = useState([]); // Todos los espacios (sin paginar)
    const [displayedSpaces, setDisplayedSpaces] = useState([]); // Espacios mostrados (paginados)
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState({
        search: '',
        city: '',
        type: ''
    });
    const [cities, setCities] = useState([]);

    useEffect(() => {
        fetchAllSpaces();
    }, []);

    useEffect(() => {
        // Aplicar filtros y paginación cuando cambian los filtros o la página
        applyFiltersAndPagination();
    }, [allSpaces, filters, currentPage]);

    const fetchAllSpaces = async () => {
        setLoading(true);
        try {
            // ✅ Usar el nuevo endpoint sin paginación
            const data = await spacesService.getAllUnpaginated();
            const spacesArray = Array.isArray(data) ? data : [];
            setAllSpaces(spacesArray);

            // Extraer ciudades únicas
            const uniqueCities = [...new Set(spacesArray.map(s => s.city).filter(Boolean))];
            setCities(uniqueCities);

            // Calcular páginas
            const filtered = applyFilters(spacesArray);
            setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching spaces:', error);
            toast.error('Error al cargar los espacios');
            setAllSpaces([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = (spaces) => {
        let filtered = spaces;

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(searchLower) ||
                s.description?.toLowerCase().includes(searchLower) ||
                s.city.toLowerCase().includes(searchLower)
            );
        }

        if (filters.city) {
            filtered = filtered.filter(s => s.city === filters.city);
        }

        if (filters.type) {
            filtered = filtered.filter(s => s.type === filters.type);
        }

        return filtered;
    };

    const applyFiltersAndPagination = () => {
        const filtered = applyFilters(allSpaces);
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        const paginated = filtered.slice(startIndex, endIndex);

        setDisplayedSpaces(paginated);
        setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
        setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            city: '',
            type: ''
        });
        setCurrentPage(1);
    };

    const goToPage = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getTypeCount = (type) => {
        return allSpaces.filter(s => s.type === type).length;
    };

    const getFilteredCount = () => {
        return applyFilters(allSpaces).length;
    };

    if (loading) {
        return (
            <div className="max-w-container-max mx-auto px-margin-desktop py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-surface-container-low rounded-xl h-80 animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-container-max mx-auto px-margin-desktop py-12">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Available Workspaces</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                        Showing {displayedSpaces.length} of {getFilteredCount()} premium spaces
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
                            <option value="">All Cities ({cities.length})</option>
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
                            <option value="">All Types ({allSpaces.length})</option>
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
                            {filters.search || filters.city || filters.type ?
                                `Showing ${getFilteredCount()} results` :
                                `All ${allSpaces.length} spaces`}
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de espacios */}
            {displayedSpaces.length === 0 ? (
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
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                        {displayedSpaces.map((space) => (
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

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>

                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => goToPage(pageNum)}
                                            className={`w-10 h-10 rounded-lg transition-colors ${currentPage === pageNum
                                                ? 'bg-primary text-on-primary'
                                                : 'hover:bg-surface-container-low'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                        </div>
                    )}

                    {/* Información de paginación */}
                    <div className="mt-4 text-center text-body-sm text-on-surface-variant">
                        Page {currentPage} of {totalPages} • Showing {displayedSpaces.length} spaces
                    </div>
                </>
            )}
        </div>
    );
};

export default Catalog;