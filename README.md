# Church of the Epiphany website starter

A lightweight church website built with **Astro + TinaCMS**, designed for static deployment on Netlify.

## What is editable in TinaCMS

- Site name, tagline, address, phone, email, worship time, social links, giving link
- Homepage headline, welcome copy, worship/outreach sections, hero photo
- Welcome, Worship, Connect, Serve, Give, and Contact page sections
- Events
- Ministries
- Uploaded images

The layout, typography, responsive behavior, and navigation are kept in code so routine editors cannot accidentally break the design.

## 1. Open it in VS Code

Unzip the project and open the `epiphany-astro-tina` folder in VS Code.

Open **Terminal > New Terminal** and run:

```bash
npm install
npm run dev
```

For an offline production build before TinaCloud is connected, run:

```bash
npm run build:local
```

Astro normally opens at `http://localhost:4321`.

The local Tina editor is normally at:

`http://localhost:4321/admin/index.html`

Local Tina editing works without TinaCloud credentials.

## 2. Put it into GitHub — easiest VS Code method

If you are rusty with Git, this is the simplest route:

1. Open the project folder in VS Code.
2. Click the **Source Control** icon in the left sidebar.
3. Click **Initialize Repository**.
4. Stage the files (the `+` beside Changes or **Stage All Changes**).
5. Enter the commit message `Initial church website` and click **Commit**.
6. If VS Code asks you to sign in to GitHub, sign in through the browser.
7. Click **Publish Branch** / **Publish to GitHub**.
8. Choose **Private repository** while you are still developing it. You can change that later.
9. Give the repository a clear name such as `epiphany-website`.

That avoids remembering command-line Git commands.

### Command-line alternative

Create an empty repository on GitHub first, then from the VS Code terminal:

```bash
git init
git add .
git commit -m "Initial church website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/epiphany-website.git
git push -u origin main
```

## 3. Connect TinaCloud

The site is set up so Tina edits content stored in this GitHub repository.

After the repository exists:

1. Go to TinaCloud and create/import a project from your GitHub repository.
2. Select the `main` branch.
3. Tina will provide a **Client ID** and **Read-only Token**.
4. For local testing, copy `.env.example` to `.env` and enter:

```text
PUBLIC_TINA_CLIENT_ID=your-client-id
TINA_TOKEN=your-token
SITE_URL=https://your-domain.example
```

Do **not** commit `.env`; it is already ignored by Git.

## 4. Deploy on Netlify

1. In Netlify choose **Add new project** / **Import an existing project**.
2. Choose GitHub and select the `epiphany-website` repository.
3. Netlify should read `netlify.toml` automatically.
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Add environment variables in Netlify:
   - `PUBLIC_TINA_CLIENT_ID`
   - `TINA_TOKEN`
   - `SITE_URL` (your final public URL)
7. Deploy.

After deployment, the CMS will be at:

`https://YOUR-SITE/admin/index.html`

Authorized Tina users can sign in there and edit content. Tina writes the change to GitHub; Netlify sees the commit and republishes the static site.

## 5. First things to edit

Before making the site public, edit these items in Tina:

- **Site Settings**: full street address, phone, email, Facebook URL, YouTube URL, Tithely giving URL, Mailchimp signup URL
- **Homepage**: replace sample text if desired and add a real parish photo
- **Events**: replace sample events with current ones
- **Pages**: confirm visitor information and Communion wording
- **Ministries**: update descriptions and add current programs

## Design philosophy

The public site is fully static. Tina is a content editing layer; it does not turn the public site into a server-rendered application. This keeps the deployment simple and inexpensive and reduces the number of things that can fail.

## Content structure

```text
content/
  site/        site settings + homepage
  pages/       regular page content
  events/      one JSON file per event
  ministries/  one JSON file per ministry
```

Routine editors should use Tina rather than editing these JSON files directly.
