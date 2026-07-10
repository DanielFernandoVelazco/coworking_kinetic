import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import spacesService from '../api/spaces.service';
import toast from 'react-hot-toast';

const Home = () => {
    const [featuredSpaces, setFeaturedSpaces] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedSpaces = async () => {
            try {
                const spaces = await spacesService.getFeatured(6);
                setFeaturedSpaces(spaces);
            } catch (error) {
                console.error('Error fetching featured spaces:', error);
                toast.error('Error al cargar los espacios destacados');
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedSpaces();
    }, []);

    return (
        <div className="max-w-container-max mx-auto px-margin-desktop">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32">
                <div className="grid grid-cols-12 gap-gutter items-center">
                    <div className="col-span-7">
                        <span className="font-label-caps text-label-caps text-tertiary mb-4 block">
                            PREMIUM SHARED WORKSPACES
                        </span>
                        <h1 className="font-display-xl text-display-xl text-on-surface mb-6">
                            Deep work, designed <br /> for <span className="text-primary italic">performance</span>.
                        </h1>
                        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-12">
                            Bespoke environments for architects, creators, and executive teams.
                            Experience the tactile warmth of a private study with the agility of a global network.
                        </p>
                        <Link to="/catalog" className="btn-primary inline-block">
                            Explore Spaces
                        </Link>
                    </div>
                    <div className="col-span-5">
                        <div className="relative h-[400px] rounded-xl overflow-hidden shadow-tactile border border-outline-variant bg-surface-container">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent pointer-events-none"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant font-headline-lg">
                                Hero Image Placeholder
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Spaces */}
            <section className="py-16">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="font-headline-lg text-headline-lg text-on-surface">Curated Collections</h2>
                        <p className="font-body-md text-on-surface-variant mt-2">
                            Spaces optimized for focus, collaboration, and high-impact meetings.
                        </p>
                    </div>
                    <Link to="/catalog" className="text-primary font-body-md hover:underline">
                        View All →
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-surface-container-low rounded-xl h-80 animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                        {featuredSpaces.map((space) => (
                            <Link
                                key={space.id}
                                to={`/spaces/${space.id}`}
                                className="group bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant hover:shadow-xl transition-all duration-300"
                            >
                                <div className="h-56 bg-surface-container relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
                                    <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant">
                                        Space Image
                                    </div>
                                    {space.isFeatured && (
                                        <span className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 font-label-caps text-label-caps rounded-full">
                                            Featured
                                        </span>
                                    )}
                                </div>
                                <div className="p-6">
                                    <h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">
                                        {space.name}
                                    </h3>
                                    <p className="text-body-sm text-on-surface-variant mt-1">
                                        {space.city}, {space.country}
                                    </p>
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="font-headline-md text-primary">
                                            ${space.pricePerHour}
                                            <span className="text-body-sm text-on-surface-variant font-body-sm"> /hr</span>
                                        </span>
                                        <span className="text-body-sm text-on-surface-variant">
                                            ⭐ {space.averageRating?.toFixed(1) || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;