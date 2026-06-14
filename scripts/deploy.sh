#!/usr/bin/env bash
#
# Build the Hugo site and deploy to S3 + CloudFront.
#
# Usage:
#   AWS_PROFILE=default AWS_REGION=us-west-2 \
#   S3_BUCKET=saas11-site-prod CF_DISTRIBUTION_ID=E123ABC \
#   ./scripts/deploy.sh
#
# Requires: hugo (extended), awscli v2.
set -euo pipefail

cd "$(dirname "$0")/.."

: "${S3_BUCKET:?Set S3_BUCKET to your website bucket name}"
BASE_URL="${BASE_URL:-https://www.saas11.com/}"

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

if [[ -n "${CF_DISTRIBUTION_ID:-}" ]]; then
  echo "==> Invalidating CloudFront ${CF_DISTRIBUTION_ID} …"
  aws cloudfront create-invalidation \
    --distribution-id "$CF_DISTRIBUTION_ID" \
    --paths "/*" >/dev/null
fi

echo "==> Done."
