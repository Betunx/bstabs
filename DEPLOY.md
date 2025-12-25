# Black Sheep Tabs - Deployment Guide

## Cloudflare Pages Configuration

### Build Settings

**Framework preset:** None

**Build command:**
```bash
bash build.sh
```

**Build output directory:**
```
frontend/black-sheep-app/dist/black-sheep-app/browser
```

**Root directory:** (leave empty)

**Node.js version:** 18 or higher

### Environment Variables

No environment variables required for frontend build.

---

## Manual Deployment Steps

### 1. Connect GitHub Repository

1. Go to Cloudflare Dashboard → Workers & Pages
2. Click "Create application" → "Pages" → "Connect to Git"
3. Select repository: `Betunx/bstabs`
4. Authorize Cloudflare Pages access

### 2. Configure Build Settings

Use the settings above in "Build Settings"

### 3. Add Custom Domain

1. Go to project → Custom domains
2. Click "Set up a custom domain"
3. Add both:
   - `bstabs.com`
   - `www.bstabs.com`
4. Cloudflare will automatically configure DNS

### 4. Deploy

1. Click "Save and Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Verify deployment at:
   - `https://[project-name].pages.dev`
   - `https://bstabs.com`

---

## Troubleshooting

### Build fails with "ng: not found"

**Cause:** Dependencies not installed

**Solution:** Ensure build command includes `npm ci` or uses `bash build.sh`

### Domain shows "Nothing is here yet"

**Possible causes:**
1. Build output directory is incorrect
2. Domain not properly connected to project
3. Deployment not yet propagated (wait 5-10 minutes)

**Solution:**
1. Verify build output directory: `frontend/black-sheep-app/dist/black-sheep-app/browser`
2. Remove and re-add custom domain in Cloudflare Pages
3. Force new deployment

### DNS not resolving

**Solution:**
1. Check DNS records in Cloudflare DNS dashboard
2. Should see CNAME records pointing to `[project-name].pages.dev`
3. DNS propagation can take up to 48 hours (usually 5-10 minutes)

---

## Quick Deploy Checklist

- [ ] GitHub repository connected
- [ ] Build command: `bash build.sh`
- [ ] Build output: `frontend/black-sheep-app/dist/black-sheep-app/browser`
- [ ] Custom domains added: `bstabs.com` and `www.bstabs.com`
- [ ] First deployment successful
- [ ] Site accessible at production domain

---

## Project Structure

```
blackSheep/
├── build.sh                      # Build script for Cloudflare Pages
├── frontend/
│   └── black-sheep-app/
│       ├── src/                  # Angular source code
│       ├── dist/                 # Build output (generated)
│       └── package.json          # Frontend dependencies
├── backend/                      # NestJS API (separate deployment)
└── backend-workers/              # Cloudflare Workers API
```

---

Last updated: 2025-12-25
