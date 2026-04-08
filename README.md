# RVLT SUPPLY — Streetwear Media Kit Website

Premium streetwear brand media kit website with Y2K aesthetic, drop-based storytelling, and cinematic presentation.

## Sections

- **Hero** — Bold brand landing with animated stats
- **Manifesto** — Brand story with streetwear tone
- **Drops** — Live countdown + product cards (sold out / coming soon)
- **Lookbook** — Editorial-style visual grid
- **Community** — Newsletter signup for drop alerts
- **Collaborate** — Influencer, brand, press, and stockist inquiries
- **Media Kit** — Downloadable press assets (brand guidelines, photos, logos, press release)

## Tech

Pure HTML + CSS + JavaScript. No frameworks, no build step, no dependencies.

## Deploy

### GitHub Pages
1. Go to your repo **Settings → Pages**
2. Under **Source**, select **main** branch and **/ (root)**
3. Click **Save** — your site will be live at `https://<username>.github.io/mediakit-website/`

### Vercel
1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. It auto-detects a static site — click **Deploy**
3. Done. You'll get a `.vercel.app` URL instantly.

## Customization

- **Brand name**: Replace "RVLT SUPPLY" / "RVLT" in `index.html`
- **Colors**: Edit CSS variables in `:root` at the top of `styles.css`
- **Images**: Replace the placeholder `<div>` elements with real `<img>` tags
- **Drop countdown**: The timer auto-sets to 14 days from now. Edit the date in `script.js`
- **Contact email**: Update `hello@rvltsupply.com` in the collab section
- **Social links**: Update the footer link `href` attributes
