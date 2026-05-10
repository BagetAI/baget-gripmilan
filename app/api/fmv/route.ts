import { NextRequest, NextResponse } from 'next/server';

const DB_ID = '0ca0f950-1384-4875-83f3-a6c19f1550f2';

interface FMVRequest {
  brand: string;
  model: string;
  damage?: string; // 'Edge' | 'Rand' | 'Heel'
}

function adjustPriceForDamage(price: number, damage?: string): number {
  if (!damage) return price;

  // Damage impact heuristic:
  // Edge (toe box) damage: -30%
  // Rand damage: -25%
  // Heel damage: -20%

  const damageModifiers: Record<string, number> = {
    'Edge': 0.7,
    'Rand': 0.75,
    'Heel': 0.8
  };

  const modifier = damageModifiers[damage] || 1;
  return Math.round(price * modifier);
}

export async function POST(req: NextRequest) {
  try {
    const body: FMVRequest = await req.json();
    const { brand, model, damage } = body;

    if (!brand || !model) {
      return NextResponse.json({ error: 'brand and model are required' }, { status: 400 });
    }

    // Fetch all rows from the MilaneseSecondaryMarket database
    const res = await fetch(`https://app.baget.ai/api/public/databases/${DB_ID}/rows`);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 502 });
    }

    const data = await res.json();
    const rows = data.rows || [];

    // Filter rows by brand and model (case insensitive, partial)
    const filtered = rows.filter((row: any) => 
      row.manufacturer.toLowerCase().includes(brand.toLowerCase()) && 
      row.shoe_model.toLowerCase().includes(model.toLowerCase())
    );

    if (filtered.length === 0) {
      return NextResponse.json({ error: 'No matching footwear found' }, { status: 404 });
    }

    // Calculate average resale price among filtered rows
    const avgPrice = Math.round(filtered.reduce(
      (acc: number, r: any) => acc + r.current_resale_price, 0
    ) / filtered.length);

    // Adjust price based on damage
    const adjustedPrice = adjustPriceForDamage(avgPrice, damage);

    return NextResponse.json({ 
      brand, 
      model, 
      damage: damage || 'None', 
      suggested_resale_price: adjustedPrice
    });

  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
