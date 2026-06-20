/**
 * POST /api/ingest
 * Receives a sensor reading from serial_reader.py and stores it.
 *
 * Expected body:
 *   { msg_id, device_id, ts, value, raw }
 *
 * Optional auth: x-ingest-secret header must match INGEST_SECRET env var.
 */

import { saveReading } from '../../../lib/kv.js';

export const dynamic = 'force-dynamic';

const SECRET = process.env.INGEST_SECRET ?? '';

export async function POST(req) {
  // Auth
  if (SECRET) {
    const provided = req.headers.get('x-ingest-secret') ?? '';
    if (provided !== SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Parse body
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const raw_value = body?.value;
  if (raw_value === undefined || raw_value === null || isNaN(Number(raw_value))) {
    return Response.json({ error: 'Missing or non-numeric "value" field' }, { status: 400 });
  }

  const reading = {
    msg_id:    body.msg_id    ?? crypto.randomUUID(),
    device_id: body.device_id ?? 'unknown',
    ts:        body.ts        ?? new Date().toISOString(),
    value:     Number(raw_value),
    raw:       body.raw       ?? String(raw_value),
  };

  try {
    await saveReading(reading);
  } catch (err) {
    console.error('[ingest] saveReading error:', err);
    return Response.json({ error: 'Storage error' }, { status: 500 });
  }

  return Response.json({ ok: true, reading });
}
