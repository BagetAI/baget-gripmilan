import React, { useEffect, useState } from 'react';

const WAITLIST_DB = 'a263e187-4a2a-472b-a6d5-4856937d0aec';
const MARKET_DB = '0ca0f950-1384-4875-83f3-a6c19f1550f2';

const PASSWORD = process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD || 'gripmilan2026';

export default function Dashboard() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const [userCount, setUserCount] = useState<number | null>(null);
  const [listingsCount, setListingsCount] = useState<number | null>(null);
  const [avgPrice, setAvgPrice] = useState<number | null>(null);
  const [retailAvg, setRetailAvg] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authenticated) {
      fetchDashboardData();
    }
  }, [authenticated]);

  async function fetchDashboardData() {
    setLoading(true);
    setError('');
    try {
      // Fetch user count from waitlist DB count endpoint
      const waitlistCountRes = await fetch(`https://app.baget.ai/api/public/databases/${WAITLIST_DB}/count`);
      if (!waitlistCountRes.ok) throw new Error('Failed to fetch waitlist count');
      const waitlistData = await waitlistCountRes.json();
      setUserCount(waitlistData.count || 0);

      // Fetch listing rows to count active listings and average price
      const waitlistRowsRes = await fetch(`https://app.baget.ai/api/public/databases/${WAITLIST_DB}/rows?limit=200`);
      if (!waitlistRowsRes.ok) throw new Error('Failed to fetch waitlist rows');
      const waitlistRowsData = await waitlistRowsRes.json();
      const rows = waitlistRowsData.rows || [];

      const activeListings = rows.filter((r: any) => ['listing_pending', 'verified', 'sold'].includes(r.status));
      setListingsCount(activeListings.length);
      const avgPriceCalc = activeListings.reduce((acc: number, r: any) => acc + (r.price || 0), 0) / Math.max(activeListings.length, 1);
      setAvgPrice(Math.round(avgPriceCalc));

      // Fetch all market data rows to compute average retail price
      const marketDataRes = await fetch(`https://app.baget.ai/api/public/databases/${MARKET_DB}/rows?limit=50`);
      if (!marketDataRes.ok) throw new Error('Failed to fetch market data');
      const marketData = await marketDataRes.json();
      const marketRows = marketData.rows || [];
      const avgRetail = marketRows.reduce((acc: number, r: any) => acc + (r.retail_price || 0), 0) / Math.max(marketRows.length, 1);
      setRetailAvg(Math.round(avgRetail));
    } catch (e) {
      setError('Error loading dashboard data.');
    } finally {
      setLoading(false);
    }
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === PASSWORD) {
      setAuthenticated(true);
    } else {
      setError('Incorrect password.');
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lavender-50">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-violet-900">GripMilan Pilot Dashboard Login</h2>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field w-full mb-4"
              autoFocus
            />
            <button type="submit" className="btn-primary w-full py-3 rounded-xl text-lg">Login</button>
            {error && <p className="text-red-600 mt-4 font-semibold">{error}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lavender-50 p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-violet-900">GripMilan Pilot Performance Dashboard</h1>

      {loading && <p className="text-violet-700">Loading data...</p>}
      {error && <p className="text-red-600 font-semibold mb-6">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-violet-900 mb-2">Total Participants</h2>
            <div className="text-5xl font-bold text-teal-600">{userCount ?? '-'}</div>
            <p className="text-sm text-violet-600 mt-2">Climbers signed up for the pilot</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-violet-900 mb-2">Active Listings</h2>
            <div className="text-5xl font-bold text-teal-600">{listingsCount ?? '-'}</div>
            <p className="text-sm text-violet-600 mt-2">Listings pending or verified</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-violet-900 mb-2">Average Listing Price</h2>
            <div className="text-5xl font-bold text-teal-600">€{avgPrice ?? '-'}</div>
            <p className="text-sm text-violet-600 mt-2">Compared to avg retail €{retailAvg ?? '-'}</p>
          </div>
        </div>

      )}
    </div>
  );
}
