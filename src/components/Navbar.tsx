"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="glass" style={{ margin: '1rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '1rem', zIndex: 100 }}>
            <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                RIDE
            </Link>

            <div style={{ display: 'flex', gap: '1.5rem', fontWeight: '500', alignItems: 'center' }}>
                <Link href="/">Home</Link>
                <Link href="/rides">Rides</Link>
                {session?.user && (
                    <Link href="/profile">Profile</Link>
                )}
                {session?.user?.role === 'ADMIN' && (
                    <Link href="/admin" style={{ color: 'var(--accent)' }}>Admin</Link>
                )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {session ? (
                    <>
                        <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
                            {session.user?.name}
                        </span>
                        <button
                            onClick={() => signOut()}
                            className="btn"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', border: '1px solid var(--card-border)' }}
                        >
                            Sign Out
                        </button>
                    </>
                ) : (
                    <Link href="/login" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                        Sign In
                    </Link>
                )}
            </div>
        </nav>
    );
}
