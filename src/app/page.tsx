import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const createRideHref = session ? "/rides/create" : "/login?callbackUrl=/rides/create";

  return (
    <div style={{ paddingTop: '4rem', paddingBottom: '8rem' }}>
      <section style={{ textAlign: 'center', marginBottom: '6rem' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', lineHeight: '1.1' }}>
          Ride Together, <br />
          <span style={{ color: 'var(--accent)' }}>Never Lose the Group.</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto 3rem' }}>
          The ultimate platform for group bike riding. Plan itineraries, share locations, and coordinate seamlessly without the WhatsApp chaos.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href={createRideHref} className="btn btn-primary">Create Your First Ride</Link>
          <Link href="/rides" className="btn" style={{ border: '1px solid var(--card-border)' }}>Explore Public Rides</Link>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Itineraries</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Detailed route planning with stops, times, and points of interest for every journey.</p>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>Participation</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Know exactly who's joining and who's canceled. No more managing long lists in chat.</p>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Public Rides</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Discover and join rides to Neelum, Kaghan, and other scenic routes managed by pros.</p>
        </div>
      </section>
    </div>
  );
}
