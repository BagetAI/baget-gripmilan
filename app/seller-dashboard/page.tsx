import React, { useEffect, useState } from "react";

const WAITLIST_DB = "a263e187-4a2a-472b-a6d5-4856937d0aec";

// A mapping for status tags display
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  listing_pending: { label: "Pending Verification", color: "bg-yellow-300 text-yellow-900" },
  verified: { label: "Verified Rand", color: "bg-teal-300 text-teal-900" },
  sold: { label: "Sold", color: "bg-gray-300 text-gray-900" },
  cancelled: { label: "Cancelled", color: "bg-red-300 text-red-900" },
  delisted: { label: "Delisted", color: "bg-gray-400 text-gray-900" },
};

// Status steps for the verification progress stepper
const VERIFICATION_STEPS = [
  "Listing Created",
  "Drop-off at Gym",
  "Inspection in Progress",
  "Verified",
  "Listed Live",
  "Sold",
];

interface Listing {
  id: string;
  email: string;
  shoe_model: string;
  manufacturer: string;
  size: string;
  price: number;
  status: string;
  createdAt?: string;
}

export default function SellerDashboard() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchListings(email: string) {
    setLoading(true);
    setError("");
    try {
      // Query all rows for the given email
      const res = await fetch(`https://app.baget.ai/api/public/databases/${WAITLIST_DB}/rows`);
      if (!res.ok) throw new Error("Failed to fetch data");

      const data = await res.json();
      const allRows = data.rows || [];
      // Filter listings by email
      const filtered = allRows.filter((item: any) => item.email === email);

      // Sort by createdAt desc if present
      filtered.sort((a: any, b: any) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });

      setListings(filtered);
    } catch (e) {
      setError("Error loading listings. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === "") {
      setError("Please enter your email.");
      return;
    }
    fetchListings(email.trim());
  };

  function renderStatusTag(status: string) {
    const tag = STATUS_LABELS[status] || { label: status, color: "bg-gray-300 text-gray-900" };
    return (
      <span className={`${tag.color} rounded-full px-3 py-1 text-xs font-semibold uppercase`}>{tag.label}</span>
    );
  }

  function renderProgress(status: string) {
    // Map status to step index;
    let activeStep = VERIFICATION_STEPS.findIndex(s => s.toLowerCase().includes(status.toLowerCase()));
    if (activeStep < 0) activeStep = 0; // default earliest step

    return (
      <div className="flex items-center space-x-4 mt-2">
        {VERIFICATION_STEPS.map((step, i) => {
          const isActive = i === activeStep;
          const isCompleted = i < activeStep;
          return (
            <div key={i} className="flex items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2
                  ${isActive ? "border-teal-600 bg-teal-300 text-teal-900" : isCompleted ? "border-teal-600 bg-teal-600 text-white" : "border-gray-300 bg-gray-100 text-gray-400"
                  }`}
                aria-current={isActive ? 'step' : undefined}
              >
                {i + 1}
              </div>
              {i < VERIFICATION_STEPS.length - 1 && (
                <div
                  className={`w-12 h-1 ${isCompleted ? "bg-teal-600" : "bg-gray-300"} mx-2 rounded-sm`}
                  aria-hidden="true"
                ></div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender-50 via-white to-white py-12 px-6 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-violet-900">Your Gear Listings</h1>

      <form onSubmit={handleSubmit} className="mb-8 max-w-md">
        <label className="block text-sm font-semibold mb-2 text-violet-900">Enter Your Email to Load Your Listings</label>
        <input
          type="email"
          placeholder="climber@milan.it"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field border-violet-900"
          required
        />
        <button
          type="submit"
          className="btn-primary mt-4 w-full py-3 rounded-xl text-lg"
          disabled={loading}
        >
          {loading ? "Loading..." : "Load Listings"}
        </button>
      </form>

      {error && (
        <p className="text-red-600 font-semibold mb-6">{error}</p>
      )}

      {listings.length === 0 && !loading && !error && (
        <p className="text-violet-600">No listings found. Enter your email above to see your active gear listings.</p>
      )}

      <ul className="space-y-6">
        {listings.map((listing) => (
          <li
            key={listing.id}
            className="bg-white border-2 border-violet-900 rounded-xl p-6 shadow-lg"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-violet-900">{listing.shoe_model}</h2>
                <p className="text-sm text-violet-700">{listing.manufacturer} • Size EU {listing.size}</p>
              </div>
              <div className="text-lg font-bold text-teal-600">€{listing.price.toFixed(2)}</div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              {renderStatusTag(listing.status)}
              {renderProgress(listing.status)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
