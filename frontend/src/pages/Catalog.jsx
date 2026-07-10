import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import spacesService from '../api/spaces.service';
import toast from 'react-hot-toast';

const Catalog = () => {
    const [spaces, setSpaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        city: '',
        type: ''
    });

    useEffect(() => {
        fetchSpaces();
    }, [filters]);

    const fetchSpaces = async () => {
        setLoading(true);
        try {
            let data;
            if (filters.search) {
                data = await spacesService.search(filters.search, filters.city, filters.type);
            } else {
                data = await spacesService.getAll();
            }
            setSpaces(data);
        } catch (error) {
            console.error('Error fetching spaces:', error);
            toast.error('Error al cargar los espacios');
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

    return (
        <div className="max-w-container-max mx-auto px-margin-desktop py-12">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Available Workspaces</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                        {loading ? 'Loading...' : `Showing ${spaces.length} premium spaces`}
                    </p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <input
                            type="text"
                            name="city"
                            value={filters.city}
                            onChange={handleFilterChange}
                            placeholder="Filter by city..."
                            className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                        />
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
                            <option value="">All Types</option>
                            <option value="Premium Office">Premium Office</option>
                            <option value="Meeting Room">Meeting Room</option>
                            <option value="Dedicated Desk">Dedicated Desk</option>
                            <option value="Focus Pod">Focus Pod</option>
                            <option value="Creative Space">Creative Space</option>
                        </select>
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
                                        <img src={space.imageUrls[0]} alt={space.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-6xl">meeting_room</span>
                                    )}
                                </div>
                                {space.isFeatured && (
                                    <span className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 font-label-caps text-label-caps rounded-full">
                                        Featured
                                    </span>
                                )}
                                {space.isAvailable ? (
                                    <span className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 font-label-caps text-label-caps rounded-full text-xs">
                                        Available
                                    </span>
                                ) : (
                                    <span className="absolute top-4 right-4 bg-error text-on-error px-3 py-1 font-label-caps text-label-caps rounded-full text-xs">
                                        Unavailable
                                    </span>
                                )}
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                                        {space.name}
                                    </h3>
                                    <span className="font-headline-md text-primary">
                                        ${space.pricePerHour}
                                        <span className="text-body-sm text-on-surface-variant font-body-sm"> /hr</span>
                                    </span>
                                </div>
                                <p className="text-body-sm text-on-surface-variant mb-2">
                                    <span className="material-symbols-outlined text-sm align-middle">location_on</span>
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
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Catalog;