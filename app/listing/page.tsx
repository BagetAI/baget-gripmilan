import React, { useState } from 'react';

const DB_ID = 'a263e187-4a2a-472b-a6d5-4856937d0aec';

const forbiddenKeywords = [
  'rope', 'ropes', 'harness', 'harnesses', 'carabiner', 'carabiners',
  'quickdraw', 'quickdraws', 'belay', 'helmet', 'helmets'
];

function containsForbiddenKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  for (const kw of forbiddenKeywords) {
    if (lower.includes(kw)) return true;
  }
  return false;
}

const sizes = [38, 39, 40, 41, 42, 43, 44, 45];
const manufacturers = ['La Sportiva', 'Scarpa', 'Tenaya', 'Unparallel', 'Five Ten', 'Black Diamond'];

export default function ListingPage() {
  const [step, setStep] = useState(1);
  const [manufacturer, setManufacturer] = useState(manufacturers[0]);
  const [model, setModel] = useState('');
  const [size, setSize] = useState(40);
  const [photos, setPhotos] = useState<string[]>([]); // Store base64 or URLs for photos
  const [price, setPrice] = useState(130);
  const [email, setEmail] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Photo capture simulation for demo (base64 placeholders or empty)
  function addPhoto() {
    if (photos.length < 3) {
      const newPhoto = `photo${photos.length + 1}`;
      setPhotos([...photos, newPhoto]);
    }
  }

  function canProceedToNext() {
    if (step === 2) {
      return model.trim().length > 0;
    }
    if (step === 3) {
      return true; // No input
    }
    if (step === 4) {
      return photos.length === 3;
    }
    if (step === 5) {
      return email.trim() !== '' && price > 0;
    }
    return true;
  }

  function handleNext() {
    if (!canProceedToNext()) {
      setSubmitError('Please complete required fields before continuing.');
      return;
    }
    setSubmitError('');
    setStep(s => Math.min(s + 1, 6));
  }

  function handlePrev() {
    setSubmitError('');
    setStep(s => Math.max(s - 1, 1));
  }

  async function handleSubmit() {
    setSubmitError('');
    if (containsForbiddenKeyword(model) || containsForbiddenKeyword(manufacturer)) {
      setSubmitError('Category III PPE detected in your listing. Please remove forbidden items.');
      return;
    }
    if (!email) {
      setSubmitError('Email is required for submission.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`https://stg-app.baget.ai/api/public/databases/${DB_ID}/rows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            email,
            shoe_model: model.trim(),
            manufacturer,
            size: size.toString(),
            price: Number(price),
            status: 'listing_pending',
            source: 'mobile_listing_flow'
          }
        })
      });

      if (!res.ok) {
        throw new Error('Failed to submit');
      }

      setStep(6);
    } catch (error) {
      setSubmitError('Failed to submit your listing. Please try again later.');
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-violet-900 text-white">
      <div className="fixed top-0 left-0 right-0 p-4 bg-violet-800/90 backdrop-blur z-50 flex justify-between items-center">
        <button onClick={handlePrev} disabled={step === 1} className="opacity-80 hover:opacity-100 transition">
          &larr; Back
        </button>
        <div className="text-sm uppercase tracking-widest font-bold">
          Step {step} of 6
        </div>
        <div style={{ width: '60px' }} />
      </div>

      <div className="pt-20 px-6 max-w-lg mx-auto">
        {step === 1 && (
          <section>
            <h1 className="text-4xl font-800 mb-6">Start Your Listing</h1>
            <p className="opacity-70 mb-10">We only accept Category II PPE to ensure safety and trust.</p>
            <div className="space-y-4">
              <div className="option-card bg-teal-600 text-violet-900 cursor-default flex justify-between items-center p-6 rounded-xl">
                <div>
                  <h2 className="text-2xl font-bold">Climbing Shoes</h2>
                  <p className="text-sm opacity-80">Performance, Beginner, or Rentals</p>
                </div>
                <div className="text-4xl">🧗‍♀️</div>
              </div>
              <div className="option-card opacity-50 flex justify-between items-center p-6 rounded-xl cursor-not-allowed">
                <div>
                  <h2 className="text-2xl font-bold">Bouldering Pads (Coming Soon)</h2>
                  <p className="text-sm opacity-50">Crashpads only</p>
                </div>
                <div className="text-3xl">🔒</div>
              </div>
            </div>
            <button onClick={handleNext} className="btn-primary mt-10 w-full py-4 rounded-xl text-xl">
              Continue
            </button>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2 className="text-3xl font-800 mb-6">Shoe Identity</h2>
            <label className="block mb-2 font-bold uppercase text-xs opacity-70">Manufacturer</label>
            <select
              value={manufacturer}
              onChange={e => setManufacturer(e.target.value)}
              className="input-dark mb-6"
            >
              {manufacturers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <label className="block mb-2 font-bold uppercase text-xs opacity-70">Model Name</label>
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="e.g. Solution Comp"
              className="input-dark mb-6"
            />

            <label className="block mb-2 font-bold uppercase text-xs opacity-70">Size (EU)</label>
            <div className="grid grid-cols-4 gap-3">
              {sizes.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`size-btn ${size === s ? 'active' : ''}`}
                >
                  {s}
                </button>
              ))}
            </div>

            <button onClick={handleNext} className="btn-primary mt-10 w-full py-4 rounded-xl text-xl">
              Continue
            </button>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2 className="text-3xl font-800 mb-6 text-peach-400">The Rand Check</h2>
            <p className="opacity-70 mb-6">
              Buyers pay a premium for "Verified Rand" status. We need 3 clear macro-shots.
            </p>
            <img
              src="/images/a-high-fidelity-mobile-app-interface-scr.png"
              alt="Inspection Guide"
              className="rounded-xl mb-8 w-full"
            />
            <ul className="space-y-4">
              <li className="flex items-center gap-3 p-4 rounded-xl bg-black bg-opacity-30 border border-white/20">
                <span className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center font-bold">1</span>
                Toe Box Edge (Wear Check)
              </li>
              <li className="flex items-center gap-3 p-4 rounded-xl bg-black bg-opacity-30 border border-white/20">
                <span className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center font-bold">2</span>
                Side Rand (Stitching Integrity)
              </li>
              <li className="flex items-center gap-3 p-4 rounded-xl bg-black bg-opacity-30 border border-white/20">
                <span className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center font-bold">3</span>
                Heel Tension (Rubber Stretch)
              </li>
            </ul>

            <button onClick={handleNext} className="btn-primary mt-10 w-full py-4 rounded-xl text-xl bg-peach-300 text-violet-900 border-violet-900">
              Start Camera
            </button>
          </section>
        )}

        {step === 4 && (
          <section className="flex flex-col items-center justify-between min-h-[65vh]">
            <div className="mb-6 relative">
              <div className="w-64 h-96 border-2 border-dashed border-teal-500/50 rounded-[30px] flex items-center justify-center">
                <span className="text-xs font-bold uppercase tracking-widest text-teal-500/50">
                  Place shoe here
                </span>
              </div>
            </div>
            <div className="flex justify-center gap-10 w-full max-w-xs mb-16">
              <button
                type="button"
                className="text-sm px-6 py-3 border rounded-lg border-white/50 opacity-50"
                onClick={addPhoto}
                disabled={photos.length >= 3}
              >
                {photos.length < 3 ? 'Capture Photo' : 'Photos Complete'}
              </button>
              <button
                type="button"
                className="btn-primary px-6 py-3 rounded-lg"
                onClick={handleNext}
                disabled={photos.length !== 3}
              >
                Continue
              </button>
            </div>
            <div className="text-center text-xs opacity-60">
              {photos.length} / 3 photos captured
            </div>
          </section>
        )}

        {step === 5 && (
          <section>
            <h2 className="text-3xl font-800 mb-4">Smart Pricing</h2>
            <p className="opacity-70 mb-6 text-sm">We suggest prices that actually sell in Milan.</p>

            <div className="bg-black bg-opacity-20 rounded-xl p-6 mb-6 border border-white/20">
              <div className="flex justify-between opacity-50 mb-2 text-xs font-bold tracking-widest uppercase">
                <span>Retail Benchmarks</span>
                <span>~€175.00</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold">Suggested Resale</span>
                <span className="text-3xl font-extrabold">€{price.toLocaleString()}</span>
              </div>
              <div className="verified-badge inline-flex items-center gap-2">
                <span>✓</span> Verified Rand
              </div>
              <div className="h-2 rounded-full bg-teal-600 mt-4" style={{ width: '75%' }} />
              <p className="mt-2 text-sm italic opacity-60">Expected to sell within 48 hours at this price.</p>
            </div>

            <label className="block mb-1 font-bold uppercase text-xs opacity-70" htmlFor="price">Asking Price (€)</label>
            <input
              id="price"
              type="number"
              min={10}
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              className="input-dark mb-6 text-teal-400 font-bold text-3xl border-teal-500/50"
            />

            <label className="block mb-1 font-bold uppercase text-xs opacity-70" htmlFor="email">Your Email (Verification)</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="climber@milan.it"
              className="input-dark mb-8"
            />

            {submitError && <p className="text-red-400 mb-4 font-bold">{submitError}</p>}

            <button
              onClick={handleSubmit}
              className="btn-primary w-full py-4 rounded-xl text-xl"
              disabled={submitting}
            >
              {submitting ? 'Publishing...' : 'Publish Verification'}
            </button>
          </section>
        )}

        {step === 6 && (
          <section className="text-center pt-20">
            <div className="mx-auto mb-10 w-24 h-24 bg-teal-600 rounded-3xl rotate-12 flex items-center justify-center border-4 border-white shadow-2xl">
              <span className="text-6xl">✅</span>
            </div>
            <h2 className="text-4xl font-800 mb-4">Awaiting Rand Scan</h2>
            <p className="opacity-70 max-w-md mx-auto mb-10">
              Our team is verifying your "Verified Rand" badge. You’ll get an email once your listing hits the Milan feed.
            </p>
            <div className="rounded-xl p-8 bg-peach-300 text-violet-900 border-4 border-white shadow-lg -rotate-1 mb-12 max-w-lg mx-auto">
              <h3 className="font-bold text-lg mb-2">Next Safe-Swap: June 7</h3>
              <p className="text-sm font-medium opacity-80 mb-4">Finalize your swap in person at Manga Climbing Precotto and skip the vetting process.</p>
              <a href="/index.html#waitlist" className="font-bold uppercase text-sm underline">
                RSVP for June 7th →
              </a>
            </div>
            <button onClick={() => setStep(1)} className="btn-primary w-full py-4 rounded-xl text-xl">
              Return to Community
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
