"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CreateRidePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        startLocation: "",
        endLocation: "",
        visibility: true,
    });
    const [itinerary, setItinerary] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (status === "unauthenticated" || (status === "authenticated" && (session?.user as any)?.canOrganize === false && (session?.user as any)?.role !== 'ADMIN')) {
            router.push("/");
        }
    }, [status, session, router]);

    if (status === "loading") return <div style={{ textAlign: 'center', paddingTop: '4rem' }}>Loading...</div>;

    if (status === "unauthenticated" || ((session?.user as any)?.canOrganize === false && (session?.user as any)?.role !== 'ADMIN')) {
        return null;
    }

    const handleAddStop = () => {
        setItinerary([...itinerary, { title: "", description: "", plannedTime: "" }]);
    };

    const handleRemoveStop = (index: number) => {
        setItinerary(itinerary.filter((_, i) => i !== index));
    };

    const handleStopChange = (index: number, field: string, value: string) => {
        const newItinerary = [...itinerary];
        newItinerary[index][field] = value;
        setItinerary(newItinerary);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/rides", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, itinerary }),
            });

            if (res.ok) {
                router.push("/rides");
            } else {
                const data = await res.json();
                setError(data.message || "Failed to create ride");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ paddingTop: '4rem', maxWidth: '800px', margin: '0 auto', paddingBottom: '8rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Create a New Ride</h1>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
                <div className="card glass">
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Basic Information</h2>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ride Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Weekend Ride to Neelum Valley"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Date</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Visibility</label>
                                <select
                                    value={formData.visibility ? "public" : "private"}
                                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value === "public" })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                                >
                                    <option value="public">Public (Everyone can see and join)</option>
                                    <option value="private">Private (Only via link)</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Start Location</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.startLocation}
                                    onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>End Location</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.endLocation}
                                    onChange={(e) => setFormData({ ...formData, endLocation: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card glass">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem' }}>Itinerary (Optional)</h2>
                        <button type="button" onClick={handleAddStop} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', border: '1px solid var(--primary)' }}>
                            + Add Stop
                        </button>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {itinerary.map((stop, index) => (
                            <div key={index} style={{ padding: '1rem', border: '1px solid var(--card-border)', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h4 style={{ color: 'var(--accent)' }}>Stop #{index + 1}</h4>
                                    <button type="button" onClick={() => handleRemoveStop(index)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>Remove</button>
                                </div>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                        <input
                                            placeholder="Stop Title (e.g., Breakfast at Balakot)"
                                            value={stop.title}
                                            onChange={(e) => handleStopChange(index, "title", e.target.value)}
                                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                                        />
                                        <input
                                            type="datetime-local"
                                            value={stop.plannedTime}
                                            onChange={(e) => handleStopChange(index, "plannedTime", e.target.value)}
                                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                                        />
                                    </div>
                                    <input
                                        placeholder="Short Note/Instruction"
                                        value={stop.description}
                                        onChange={(e) => handleStopChange(index, "description", e.target.value)}
                                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {error && <p style={{ color: 'var(--error)', textAlign: 'center' }}>{error}</p>}

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '3.5rem', fontSize: '1.1rem' }}>
                    {loading ? "Creating Ride..." : "Publish Ride"}
                </button>
            </form>
        </div>
    );
}
