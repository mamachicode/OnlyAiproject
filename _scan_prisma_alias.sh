#!/usr/bin/env bash
set -euo pipefail

echo "=============================="
echo "ONLYAI prisma alias scan"
echo "CWD: $(pwd)"
echo "=============================="
echo

echo "---- 1) List Next.js config + tsconfig files ----"
ls -la | sed -n '1,120p'
echo
find . -maxdepth 2 -type f \( -name "next.config.*" -o -name "tsconfig*.json" -o -name "jsconfig*.json" \) -print
echo

echo "---- 2) Show next.config.* contents (first 220 lines each) ----"
for f in next.config.js next.config.mjs next.config.cjs next.config.ts; do
  if [ -f "$f" ]; then
    echo
    echo "### FILE: $f"
    sed -n '1,220p' "$f"
  fi
done
echo

echo "---- 3) Show tsconfig*.json paths + baseUrl (if present) ----"
for f in tsconfig.json tsconfig.app.json tsconfig.base.json jsconfig.json; do
  if [ -f "$f" ]; then
    echo
    echo "### FILE: $f"
    grep -nE '"baseUrl"|"paths"' -n "$f" || true
    echo "--- full relevant blocks (paths/baseUrl vicinity) ---"
    awk '
      /"baseUrl"|\"paths\"/ {show=1}
      show==1 {print}
      show==1 && /}/ {closeCount++}
      closeCount>=2 {show=0; closeCount=0}
    ' "$f" | sed -n '1,220p' || true
  fi
done
echo

echo "---- 4) Verify the target file for @/lib/prisma actually exists ----"
echo "Expecting: src/lib/prisma.(ts|tsx|js|cjs|mjs) OR src/lib/prisma/index.(ts|js)"
echo
ls -la src/lib 2>/dev/null || echo "MISSING: src/lib directory"
echo
find src/lib -maxdepth 2 -type f 2>/dev/null | sed -n '1,200p' || true
echo

echo "---- 5) Find all prisma import usages (the actual failing ones) ----"
echo "Searching for: @/lib/prisma and @/src/lib/prisma and relative imports"
echo
grep -RIn --exclude-dir=node_modules --exclude-dir=.next \
  -E "from ['\"]@/lib/prisma['\"]|from ['\"]@/src/lib/prisma['\"]|from ['\"].*/lib/prisma['\"]|require\\(['\"].*/lib/prisma['\"]\\)" \
  app src 2>/dev/null || true
echo

echo "---- 6) Confirm where these failing files live and what they import ----"
for f in \
  app/api/ccbill/generate-link/route.ts \
  app/api/ccbill/webhook/route.ts \
  app/api/check-nsfw-subscription/route.ts
do
  echo
  echo "### FILE: $f"
  if [ -f "$f" ]; then
    sed -n '1,120p' "$f"
  else
    echo "MISSING: $f"
  fi
done
echo

echo "---- 7) Sanity: check if you even have src/app vs app split ----"
echo "Top-level folders:"
ls -la | sed -n '1,120p'
echo
echo "If src/app exists:"
ls -la src/app 2>/dev/null || echo "No src/app"
echo

echo "---- 8) Quick check: does src/lib/prisma resolve by file name? ----"
echo "Looking for any prisma client file:"
find src -maxdepth 4 -type f -iname "*prisma*" 2>/dev/null | sed -n '1,200p' || true
echo

echo "=============================="
echo "SCAN COMPLETE"
echo "Paste ALL output back here."
echo "=============================="
