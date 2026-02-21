"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { PAKISTAN_CITIES } from "@/lib/constants";

export default function ExploreRidesPage() {
    const { data: session } = useSession();
    const [rides, setRides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [filters, setFilters] = useState({
        from: "",
        to: "",
        start: "",
        destination: "",
        organizer: ""
    });

    const [suggestions, setSuggestions] = useState<{ type: 'start' | 'destination', list: string[] }>({ type: 'start', list: [] });
    const suggestionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchRides();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setSuggestions({ type: 'start', list: [] });
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchRides = async (appliedFilters = filters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (appliedFilters.from) params.append("from", appliedFilters.from);
            if (appliedFilters.to) params.append("to", appliedFilters.to);
            if (appliedFilters.start) params.append("start", appliedFilters.start);
            if (appliedFilters.destination) params.append("destination", appliedFilters.destination);
            if (appliedFilters.organizer) params.append("organizer", appliedFilters.organizer);

            const res = await fetch(`/api/rides?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setRides(data);
            }
        } catch (error) {
            console.error("Error fetching rides:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLocationChange = (type: 'start' | 'destination', value: string) => {
        setFilters(prev => ({ ...prev, [type]: value }));

        if (value.length > 1) {
            const filtered = PAKISTAN_CITIES.filter(city =>
                city.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 5);
            setSuggestions({ type, list: filtered });
        } else {
            setSuggestions({ type, list: [] });
        }
    };

    const selectSuggestion = (value: string) => {
        setFilters(prev => ({ ...prev, [suggestions.type]: value }));
        setSuggestions({ type: 'start', list: [] });
    };

    const clearFilters = () => {
        const reset = { from: "", to: "", start: "", destination: "", organizer: "" };
        setFilters(reset);
        fetchRides(reset);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchRides();
    };

    const isFiltered = Object.values(filters).some(v => v !== "");

    return (
        <div style={{ paddingTop: '4rem', paddingBottom: '8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Explore Rides</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Find upcoming group trips and join the community.</p>
                </div>
                {(session?.user as any)?.canOrganize && (
                    <Link href="/rides/create" className="btn btn-primary">
                        + Create New Ride
                    </Link>
                )}
            </div>

            {/* Filter Bar */}
            <div className="card glass" style={{ marginBottom: '3rem', padding: '1.5rem' }}>
                <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                    <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>START LOCATION</label>
                        <input
                            type="text"
                            placeholder="e.g. Islamabad"
                            value={filters.start}
                            onChange={(e) => handleLocationChange('start', e.target.value)}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                        />
                        {suggestions.type === 'start' && suggestions.list.length > 0 && (
                            <div ref={suggestionsRef} className="glass" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, borderRadius: '8px', marginTop: '4px', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                                {suggestions.list.map(city => (
                                    <div key={city} onClick={() => selectSuggestion(city)} style={{ padding: '0.75rem', cursor: 'pointer', background: 'rgba(0,0,0,0.8)' }} className="suggestion-item">
                                        {city}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>DESTINATION</label>
                        <input
                            type="text"
                            placeholder="e.g. Naran"
                            value={filters.destination}
                            onChange={(e) => handleLocationChange('destination', e.target.value)}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                        />
                        {suggestions.type === 'destination' && suggestions.list.length > 0 && (
                            <div ref={suggestionsRef} className="glass" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, borderRadius: '8px', marginTop: '4px', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                                {suggestions.list.map(city => (
                                    <div key={city} onClick={() => selectSuggestion(city)} style={{ padding: '0.75rem', cursor: 'pointer', background: 'rgba(0,0,0,0.8)' }} className="suggestion-item">
                                        {city}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>FROM DATE</label>
                        <input
                            type="date"
                            value={filters.from}
                            onChange={(e) => setFilters(prev => ({ ...prev, from: e.target.value }))}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white', colorScheme: 'dark' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>TO DATE</label>
                        <input
                            type="date"
                            value={filters.to}
                            onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value }))}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white', colorScheme: 'dark' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>ORGANIZER</label>
                        <input
                            type="text"
                            placeholder="Organizer name"
                            value={filters.organizer}
                            onChange={(e) => setFilters(prev => ({ ...prev, organizer: e.target.value }))}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '0.6rem' }}>Search</button>
                        {isFiltered && (
                            <button type="button" onClick={clearFilters} className="btn" style={{ flex: 1, padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)' }}>Clear</button>
                        )}
                    </div>
                </form>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>Filtering rides...</div>
            ) : rides.length === 0 ? (
                <div className="card glass" style={{ textAlign: 'center', padding: '4rem' }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>No public rides found at the moment.</p>
                    {(session?.user as any)?.canOrganize ? (
                        <Link href="/rides/create" className="btn" style={{ border: '1px solid var(--primary)' }}>Be the first to organize one!</Link>
                    ) : (
                        <Link href="/profile" className="btn btn-primary">Request to become an Organizer</Link>
                    )}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                    {rides.map(ride => (
                        <div key={ride.id} className="card glass" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <h3 style={{ fontSize: '1.25rem' }}>{ride.title}</h3>
                                <span className="glass" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.2)', color: 'var(--secondary)' }}>
                                    {new Date(ride.date).toLocaleDateString()}
                                </span>
                            </div>

                            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', minHeight: '3rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {ride.description}
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--accent)' }}>
                                <span>🚩 {ride.startLocation}</span>
                                <span>🏁 {ride.endLocation}</span>
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {ride.participants.find((p: any) => p.role === 'ORGANIZER')?.user.name?.[0]}
                                    </div>
                                    <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                                        {ride.participants.find((p: any) => p.role === 'ORGANIZER')?.user.name}
                                    </span>
                                </div>
                                <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>
                                    👤 {ride.participants.length} Joining
                                </span>
                                <Link href={`/rides/${ride.id}`} className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}>
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
