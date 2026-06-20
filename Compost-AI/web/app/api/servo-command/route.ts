import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// In-memory one-shot queue. The web app POSTs "GARBAGE" or "COMPOST" after
// classification; the Python bridge GETs and consumes it, then writes the
// command to the Arduino over serial.
let pending: string | null = null;

export async function POST(req: Request) {
  const { command } = await req.json();
  pending = command;
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const cmd = pending;
  pending = null;
  return NextResponse.json({ command: cmd });
}
