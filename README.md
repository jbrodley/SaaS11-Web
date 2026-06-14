# SaaS 11 — Hugo site

The saas11.com marketing site + blog, rebuilt as a fast, static
[Hugo](https://gohugo.io) site to replace the legacy WordPress install. No
database, no PHP, nothing to patch — it deploys as static files to S3 +
CloudFront.

Dark, technical design oriented around the **Service-as-Software** thesis:
AI & agentic systems, cloud-native / Kubernetes, ML/Big Data, DevOps/SRE,
agentic development & SDLC, SaaS transformation, FinOps, consumption pricing,
and tokenomics.

## Quick start

```bash
# Install Hugo extended (>= 0.163). macOS: brew install hugo
hugo server -D            # dev server at http://localhost:1313
hugo --minify             # production build into ./public
```

## Structure

```
saas11-site/
├── hugo.toml                 # config: brand, menus, params, forms, taxonomies
├── content/
│   ├── _index.md             # homepage copy (hero, capabilities, thesis,
│   │                         #   approach, stats, CTA) — all editable here
│   ├── insights/             # blog posts (Markdown)
│   └── thanks.md             # form thank-you page
├── layouts/
│   ├── _default/{baseof,list,single,thanks}.html
│   ├── index.html            # homepage sections
│   ├── 404.html
│   └── partials/{head,header,footer,contact,post-card}.html
├── assets/
│   ├── css/main.css          # design system (Hugo Pipes: minified + fingerprinted)
│   └── js/theme.js           # nav, sticky header, scroll-reveal, AJAX forms
├── static/favicon.svg
├── scripts/
│   ├── deploy.sh             # build + sync to S3 + CloudFront invalidation
│   └── lambda/               # contact + newsletter handler (Lambda + SES)
└── .github/workflows/deploy.yml
```

## Editing content

- **Homepage copy** — `content/_index.md` front matter (hero, capability cards,
  the point-of-view pillars, approach steps, stats, CTA, and the ticker).
- **Brand / nav / contact / social** — `[params]` and `[menus]` in `hugo.toml`.
- **Blog posts** — `hugo new insights/my-post.md`, write Markdown, set
  `draft: false`.

Content is Markdown in git today. If non-technical editors need a UI later, we
can add **Decap CMS** (a git-based admin) without re-platforming.

## Contact form & newsletter

Both forms post to a hosted form handler — no backend to run. Configure it in
`hugo.toml`:

**Formspree** (default)

1. Create a form at [formspree.io](https://formspree.io) and copy its endpoint.
2. Set it in `hugo.toml`:

   ```toml
   [params.forms]
     contactAction    = "https://formspree.io/f/abcdwxyz"
     newsletterAction = "https://formspree.io/f/abcdwxyz"  # reuse or a 2nd form
   ```

**Web3Forms** (alternative)

```toml
[params.forms]
  contactAction    = "https://api.web3forms.com/submit"
  newsletterAction = "https://api.web3forms.com/submit"
  web3formsKey     = "your-access-key"   # injected as a hidden field
```

The JS in `theme.js` submits via `fetch` and shows an inline success message;
if JS is off, the form does a normal POST and the provider redirects to
`/thanks/` (wired via the hidden `_next` / `redirect` field). A honeypot field
drops bots.

> Prefer an in-house, AWS-native backend instead? An optional Lambda + SES
> handler lives in `scripts/lambda/` (see its README) — just point
> `contactAction` / `newsletterAction` at its API Gateway URL.

## Deploy (AWS S3 + CloudFront)

Local:

```bash
S3_BUCKET=saas11-site-prod CF_DISTRIBUTION_ID=E123ABC \
AWS_PROFILE=default AWS_REGION=us-west-2 \
./scripts/deploy.sh
```

CI: `.github/workflows/deploy.yml` builds and deploys on push to `main` via
GitHub OIDC (set repo vars `S3_BUCKET`, `CF_DISTRIBUTION_ID`, `AWS_REGION` and
secret `AWS_DEPLOY_ROLE_ARN`).

Fingerprinted CSS/JS are cached `immutable` for a year; HTML/feeds get a short
TTL so content changes appear quickly after a CloudFront invalidation.
