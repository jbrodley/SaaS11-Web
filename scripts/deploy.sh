#!/usr/bin/env bash
#
# Build the Hugo site and deploy to S3 + CloudFront.
#
# Usage:
#   ./scripts/deploy.sh                  # deploy to production
#   ./scripts/deploy.sh --no-invalidate # deploy without CloudFront invalidation
#
# Requires: hugo (extended), awscli v2.
#
# After terraform apply, get the outputs:
#   S3_BUCKET  = terraform output saas11_website_bucket_name
#   CF_DIST_ID = terraform output saas11_cloudfront_distribution_id
#
set -euo pipefail

cd "$(dirname "$0")/.."

S3_BUCKET="${S3_BUCKET:-www.saas11.com}"
CF_DISTRIBUTION_ID="${CF_DISTRIBUTION_ID:-}"
BASE_URL="${BASE_URL:-https://www.saas11.com/}"
NO_INVALIDATE=false

for arg in "$@"; do
  case "$arg" in
    --no-invalidate) NO_INVALIDATE=true ;;
  esac
done

echo "==> Building site (production)…"
hugo --minify --gc --baseURL "$BASE_URL"

echo "==> Syncing to s3://${S3_BUCKET} …"

# 1) Long-cache the fingerprinted assets (immutable).
aws s3 sync public/ "s3://${S3_BUCKET}/" \
  --delete \
  --exclude "*.html" \
  --exclude "*.xml" \
  --exclude "*.txt" \
  --exclude "*.json" \
  --cache-control "public,max-age=31536000,immutable"

# 2) Short-cache HTML/feeds/sitemaps so content updates show up fast.
aws s3 sync public/ "s3://${S3_BUCKET}/" \
  --delete \
  --exclude "*" \
  --include "*.html" \
  --include "*.xml" \
  --include "*.txt" \
  --include "*.json" \
  --cache-control "public,max-age=300,must-revalidate" \
  --content-type "text/html; charset=utf-8" \
  --metadata-directive REPLACE 2>/dev/null || \
aws s3 sync public/ "s3://${S3_BUCKET}/" \
  --delete \
  --exclude "*" --include "*.html" --include "*.xml" --include "*.txt" --include "*.json" \
  --cache-control "public,max-age=300,must-revalidate"

# 3) Set correct content types for SVG (Hugo already sets these, but ensure)
aws s3 sync public/ "s3://${S3_BUCKET}/" \
  --delete \
  --exclude "*" \
  --include "*.svg" \
  --content-type "image/svg+xml" \
  --cache-control "public,max-age=31536000,immutable" \
  --metadata-directive REPLACE 2>/dev/null || true

if [[ -n "${CF_DISTRIBUTION_ID}" ]] && [[ "$NO_INVALIDATE" == "false" ]]; then
  echo "==> Invalidating CloudFront ${CF_DISTRIBUTION_ID} …"
  aws cloudfront create-invalidation \
    --distribution-id "$CF_DISTRIBUTION_ID" \
    --paths "/*" >/dev/null
  echo "    Invalidation requested (propagates in ~5 min)."
elif [[ -z "${CF_DISTRIBUTION_ID}" ]]; then
  echo "==> No CF_DISTRIBUTION_ID set — skipping CloudFront invalidation."
  echo "    Set CF_DISTRIBUTION_ID to enable invalidation."
fi

echo "==> Done. Site live at CloudFront URL (check terraform output saas11_cloudfront_domain_name)."
echo "    DNS cutover not yet configured — Route53 records need to be added when ready."