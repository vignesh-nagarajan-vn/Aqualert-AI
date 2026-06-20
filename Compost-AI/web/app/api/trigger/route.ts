import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// In-memory flag — lives in the Next.js server process.
// POST sets it; GET reads and clears it (one-shot consume).
let pending = false;

export async function POST() {
  pending = true;
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const fired = pending;
  pending = false;
  return NextResponse.json({ triggered: fired });
}
