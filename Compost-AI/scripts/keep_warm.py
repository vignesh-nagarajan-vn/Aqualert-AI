import sys
import time

import requests

URL = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else None
INTERVAL = int(sys.argv[2]) if len(sys.argv) > 2 else 240  # 4 min default

if not URL:
    sys.exit("Usage: python keep_warm.py <space-url> [interval-seconds]")

HEALTH = f"{URL}/health"
print(f"[keep-warm] pinging {HEALTH} every {INTERVAL}s — Ctrl+C to stop")

while True:
    try:
        r = requests.get(HEALTH, timeout=60)
        print(f"[keep-warm] {r.status_code} {r.text[:80]}")
    except requests.RequestException as e:
        print(f"[keep-warm] WARN: {e}")
    time.sleep(INTERVAL)
