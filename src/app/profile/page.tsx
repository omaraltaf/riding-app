"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "",
        bio: "",
        location: "",
        phone: "",
        bike: "",
        image: "",
    });
    const [requestLoading, setRequestLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchUserInfo();
        }
    }, [status]);

    const fetchUserInfo = async () => {
        try {
            const res = await fetch("/api/user/me");
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setEditForm({
                    name: data.name || "",
                    bio: data.bio || "",
                    location: data.location || "",
                    phone: data.phone || "",
                    bike: data.bike || "",
                    image: data.image || "",
                });
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/user/update", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });
            if (res.ok) {
                const updated = await res.json();
                setUser(updated);
                setIsEditing(false);
                setMessage("Profile updated successfully!");
                setTimeout(() => setMessage(""), 3000);
            }
        } catch (error) {
            setMessage("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const requestOrganizer = async () => {
        setRequestLoading(true);
        setMessage("");
        try {
            const res = await fetch("/api/request-organizer", { method: "POST" });
            const data = await res.json();
            setMessage(data.message);
            if (res.ok) {
                fetchUserInfo();
            }
        } catch (error) {
            setMessage("Failed to submit request");
        } finally {
            setRequestLoading(false);
        }
    };

    if (loading || status === "loading") {
        return <div style={{ textAlign: 'center', paddingTop: '4rem' }}>Loading...</div>;
    }

    return (
        <div style={{ paddingTop: '4rem', maxWidth: '800px', margin: '0 auto', paddingBottom: '8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>My Profile</h1>
                {!isEditing && (
                    <button className="btn" style={{ border: '1px solid var(--primary)' }} onClick={() => setIsEditing(true)}>
                        Edit Profile
                    </button>
                )}
            </div>

            {message && (
                <div className="glass" style={{ padding: '1rem', marginBottom: '2rem', borderRadius: '12px', textAlign: 'center', color: message.includes("success") ? 'var(--success)' : 'var(--error)' }}>
                    {message}
                </div>
            )}

            {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="card glass">
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Display Name</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Location</label>
                                <input
                                    type="text"
                                    value={editForm.location}
                                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                    placeholder="City, Country"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Profile Picture URL</label>
                            <input
                                type="text"
                                value={editForm.image}
                                onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                                placeholder="https://example.com/photo.jpg"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Phone Number</label>
                                <input
                                    type="text"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Primary Bike</label>
                                <input
                                    type="text"
                                    value={editForm.bike}
                                    onChange={(e) => setEditForm({ ...editForm, bike: e.target.value })}
                                    placeholder="e.g., Yamaha R6, BMW GS"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Bio</label>
                            <textarea
                                value={editForm.bio}
                                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                rows={3}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                            <button type="button" className="btn" style={{ flex: 1, border: '1px solid var(--error)', color: 'var(--error)' }} onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                    </div>
                </form>
            ) : (
                <div style={{ display: 'grid', gap: '2rem' }}>
                    <div className="card glass" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: user?.image ? `url(${user.image}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--accent))',
                            border: '4px solid rgba(255,255,255,0.1)'
                        }}>
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{user?.name}</h2>
                            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>{user?.email}</p>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span className="glass" style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.875rem', background: user?.role === 'ADMIN' ? 'var(--secondary)' : 'var(--primary)' }}>
                                    {user?.role}
                                </span>
                                {user?.canOrganize && (
                                    <span className="glass" style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.875rem', background: 'var(--success)' }}>
                                        ORGANIZER
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div className="card glass">
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--accent)' }}>User Details</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>LOCATION</label>
                                    <p>{user?.location || "Not set"}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>PRIMARY BIKE</label>
                                    <p>{user?.bike || "Not set"}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>PHONE</label>
                                    <p>{user?.phone || "Not set"}</p>
                                </div>
                            </div>
                        </div>
                        <div className="card glass">
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--accent)' }}>Bio</h3>
                            <p style={{ lineHeight: '1.6', color: 'rgba(255,255,255,0.8)' }}>
                                {user?.bio || "No biography provided yet."}
                            </p>
                        </div>
                    </div>

                    <div className="card glass">
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Organizer Status</h2>
                        {user?.canOrganize ? (
                            <p style={{ color: 'var(--success)' }}>You are an approved organizer. You can now create and manage rides!</p>
                        ) : user?.organizerRequestStatus === 'PENDING' ? (
                            <p style={{ color: 'var(--warning)' }}>Your request to become an organizer is currently pending review by an admin.</p>
                        ) : user?.organizerRequestStatus === 'REJECTED' ? (
                            <div>
                                <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>Your previous request was not approved.</p>
                                <button className="btn btn-primary" onClick={requestOrganizer} disabled={requestLoading}>
                                    {requestLoading ? "Submitting..." : "Try Requesting Again"}
                                </button>
                            </div>
                        ) : (
                            <div>
                                <p style={{ marginBottom: '1.5rem', color: 'rgba(255,255,255,0.7)' }}>
                                    Want to organize your own bike rides? Submit a request to become an organizer.
                                </p>
                                <button className="btn btn-primary" onClick={requestOrganizer} disabled={requestLoading}>
                                    {requestLoading ? "Submitting..." : "Become an Organizer"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
