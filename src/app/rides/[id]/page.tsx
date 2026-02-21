"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function RideDetailPage() {
    const { id } = useParams();
    const { data: session } = useSession();
    const router = useRouter();

    const [ride, setRide] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        fetchRide();
    }, [id]);

    const fetchRide = async () => {
        try {
            const res = await fetch(`/api/rides/${id}`);
            if (res.ok) {
                const data = await res.json();
                setRide(data);
            } else {
                router.push("/rides");
            }
        } catch (error) {
            console.error("Error fetching ride:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinLeave = async () => {
        if (!session) {
            router.push("/login");
            return;
        }

        setJoining(true);
        try {
            const res = await fetch(`/api/rides/${id}/join`, { method: "POST" });
            if (res.ok) {
                fetchRide();
            }
        } catch (error) {
            console.error("Error joining/leaving:", error);
        } finally {
            setJoining(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', paddingTop: '4rem' }}>Loading Ride Details...</div>;
    if (!ride) return null;

    const isParticipating = ride.participants.some((p: any) => p.user.id === (session?.user as any)?.id);
    const isOrganizer = ride.participants.find((p: any) => p.user.id === (session?.user as any)?.id)?.role === "ORGANIZER";

    return (
        <div style={{ paddingTop: '4rem', paddingBottom: '8rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem' }}>

                {/* Left Column: Details & Itinerary */}
                <div style={{ display: 'grid', gap: '2rem' }}>
                    <header>
                        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: '1.2' }}>{ride.title}</h1>
                        <div style={{ display: 'flex', gap: '1.5rem', color: 'rgba(255,255,255,0.6)', flexWrap: 'wrap' }}>
                            <span>🗓️ {new Date(ride.date).toLocaleDateString()}</span>
                            <span>🚩 {ride.startLocation} to {ride.endLocation}</span>
                            <span className="glass" style={{ padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.875rem' }}>
                                {ride.visibility ? 'Public Ride' : 'Private Ride'}
                            </span>
                        </div>
                    </header>

                    <div className="card glass">
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>About this Ride</h2>
                        <p style={{ color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                            {ride.description || "No description provided."}
                        </p>
                    </div>

                    <div className="card glass">
                        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Itinerary</h2>
                        <div style={{ position: 'relative', paddingLeft: '2rem', borderLeft: '2px solid var(--primary)' }}>
                            {ride.itinerary.map((stop: any, index: number) => (
                                <div key={stop.id} style={{ marginBottom: '2.5rem', position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: '-2.6rem',
                                        top: '0',
                                        width: '1rem',
                                        height: '1rem',
                                        borderRadius: '50%',
                                        background: 'var(--primary)',
                                        boxShadow: '0 0 10px var(--primary)'
                                    }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', color: 'var(--accent)' }}>{stop.title}</h3>
                                        <span style={{ fontSize: '0.875rem', opacity: 0.6 }}>
                                            {new Date(stop.plannedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.925rem', color: 'rgba(255,255,255,0.6)' }}>{stop.description}</p>
                                </div>
                            ))}
                            {ride.itinerary.length === 0 && <p style={{ opacity: 0.5 }}>No itinerary steps added yet.</p>}
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions & Participants */}
                <div style={{ display: 'grid', gap: '2rem', alignContent: 'start' }}>
                    <div className="card glass" style={{ border: '1px solid var(--primary)' }}>
                        <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Participation</h3>

                        <button
                            className={`btn ${isParticipating ? '' : 'btn-primary'}`}
                            style={{ width: '100%', marginBottom: '1rem', border: isParticipating ? '1px solid var(--card-border)' : 'none' }}
                            onClick={handleJoinLeave}
                            disabled={joining || isOrganizer}
                        >
                            {isOrganizer ? "You are organizing this" : isParticipating ? "Leave Ride" : "Join Ride"}
                        </button>

                        <p style={{ fontSize: '0.825rem', textAlign: 'center', opacity: 0.6 }}>
                            {ride.participants.length} riders are currently confirmed.
                        </p>
                    </div>

                    <div className="card glass">
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Riders</h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {ride.participants.map((p: any) => (
                                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {p.user.name?.[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.925rem', fontWeight: '500' }}>{p.user.name}</p>
                                        <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{p.role}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {isOrganizer && (
                        <div className="card glass" style={{ border: '1px solid var(--warning)' }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--warning)' }}>Organizer Tools</h3>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                <button className="btn" style={{ fontSize: '0.875rem', border: '1px solid var(--card-border)' }}>Edit Ride</button>
                                <button className="btn" style={{ fontSize: '0.875rem', border: '1px solid var(--error)', color: 'var(--error)' }}>Cancel Ride</button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
