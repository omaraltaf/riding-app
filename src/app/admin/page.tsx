"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const [users, setUsers] = useState<any[]>([]);
    const [rides, setRides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'users' | 'rides'>('users');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated" && (session.user as any).role !== "ADMIN") {
            router.push("/");
        } else if (status === "authenticated") {
            fetchData();
        } else if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, session]);

    const fetchData = async () => {
        try {
            const [usersRes, ridesRes] = await Promise.all([
                fetch("/api/admin/users"),
                fetch("/api/admin/rides")
            ]);
            if (usersRes.ok) setUsers(await usersRes.json());
            if (ridesRes.ok) setRides(await ridesRes.json());
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (userId: string, newStatus: string) => {
        setProcessingId(userId);
        try {
            const res = await fetch("/api/admin/approve-organizer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, status: newStatus }),
            });
            if (res.ok) {
                fetchData();
            }
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeleteRide = async (rideId: string) => {
        if (!confirm("Are you sure you want to delete this ride?")) return;
        setProcessingId(rideId);
        try {
            const res = await fetch(`/api/rides/${rideId}`, { method: "DELETE" });
            if (res.ok) fetchData();
        } catch (error) {
            console.error("Error deleting ride:", error);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading || status === "loading") {
        return <div style={{ textAlign: 'center', paddingTop: '4rem' }}>Loading Dashboard...</div>;
    }

    const pendingRequests = users.filter(u => u.organizerRequestStatus === 'PENDING');
    // const allOtherUsers = users.filter(u => u.organizerRequestStatus !== 'PENDING'); // This line is removed as per the diff

    return (
        <div style={{ paddingTop: '4rem', paddingBottom: '8rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Admin Dashboard</h1>
                <div className="glass" style={{ display: 'flex', borderRadius: '12px', padding: '0.25rem' }}>
                    <button
                        className={`btn ${activeTab === 'users' ? 'btn-primary' : ''}`}
                        style={{ padding: '0.5rem 1.5rem', background: activeTab === 'users' ? 'var(--primary)' : 'transparent', border: 'none' }}
                        onClick={() => setActiveTab('users')}
                    >
                        Users
                    </button>
                    <button
                        className={`btn ${activeTab === 'rides' ? 'btn-primary' : ''}`}
                        style={{ padding: '0.5rem 1.5rem', background: activeTab === 'rides' ? 'var(--primary)' : 'transparent', border: 'none' }}
                        onClick={() => setActiveTab('rides')}
                    >
                        Rides
                    </button>
                </div>
            </header>

            {activeTab === 'users' ? (
                <>
                    {/* Stats Overview */}
                    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                        <div className="card glass">
                            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>Total Users</p>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{users.length}</p>
                        </div>
                        <div className="card glass">
                            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>Total Organizers</p>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>
                                {users.filter(u => u.canOrganize).length}
                            </p>
                        </div>
                        <div className="card glass">
                            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>Pending Requests</p>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>
                                {pendingRequests.length}
                            </p>
                        </div>
                    </section>

                    {/* Pending Requests Table */}
                    {pendingRequests.length > 0 && (
                        <section style={{ marginBottom: '3rem' }}>
                            <h2 style={{ marginBottom: '1rem', color: 'var(--warning)' }}>Pending Organizer Requests</h2>
                            <div className="card glass" style={{ padding: 0, overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                                            <th style={{ padding: '1rem' }}>User</th>
                                            <th style={{ padding: '1rem' }}>Email</th>
                                            <th style={{ padding: '1rem' }}>Request Date</th>
                                            <th style={{ padding: '1rem' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingRequests.map(user => (
                                            <tr key={user.id} style={{ borderTop: '1px solid var(--card-border)' }}>
                                                <td style={{ padding: '1rem' }}>{user.name}</td>
                                                <td style={{ padding: '1rem' }}>{user.email}</td>
                                                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem', background: 'var(--success)' }}
                                                        onClick={() => handleStatusUpdate(user.id, 'APPROVED')}
                                                        disabled={processingId === user.id}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="btn"
                                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem', background: 'var(--error)' }}
                                                        onClick={() => handleStatusUpdate(user.id, 'REJECTED')}
                                                        disabled={processingId === user.id}
                                                    >
                                                        Reject
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* All Users Table */}
                    <section>
                        <h2 style={{ marginBottom: '1rem' }}>User Directory</h2>
                        <div className="card glass" style={{ padding: 0, overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <th style={{ padding: '1rem' }}>User</th>
                                        <th style={{ padding: '1rem' }}>Email</th>
                                        <th style={{ padding: '1rem' }}>Role</th>
                                        <th style={{ padding: '1rem' }}>Organizer?</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} style={{ borderTop: '1px solid var(--card-border)' }}>
                                            <td style={{ padding: '1rem' }}>{user.name}</td>
                                            <td style={{ padding: '1rem' }}>{user.email}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>{user.role}</span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {user.canOrganize ?
                                                    <span style={{ color: 'var(--success)' }}>Yes</span> :
                                                    <span style={{ opacity: 0.5 }}>No</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            ) : (
                <section>
                    <h2 style={{ marginBottom: '1rem' }}>Global Ride Management</h2>
                    <div className="card glass" style={{ padding: 0, overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <th style={{ padding: '1rem' }}>Ride Title</th>
                                    <th style={{ padding: '1rem' }}>Date</th>
                                    <th style={{ padding: '1rem' }}>Route</th>
                                    <th style={{ padding: '1rem' }}>Participants</th>
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rides.map(ride => (
                                    <tr key={ride.id} style={{ borderTop: '1px solid var(--card-border)' }}>
                                        <td style={{ padding: '1rem' }}>{ride.title}</td>
                                        <td style={{ padding: '1rem' }}>{new Date(ride.date).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                            {ride.startLocation} ➔ {ride.endLocation}
                                        </td>
                                        <td style={{ padding: '1rem' }}>{ride.participants.length}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                className="btn"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem', background: 'var(--error)' }}
                                                onClick={() => handleDeleteRide(ride.id)}
                                                disabled={processingId === ride.id}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {rides.length === 0 && (
                                    <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>No rides found in the system.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
}
