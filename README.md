# Church of the Epiphany website

Developer handoff for the Church of the Epiphany, Eden, North Carolina.

- **Production:** https://epiphanyeden.org
- **Repository:** https://github.com/EpiphanyEdenNC/EpiphanyWebsite202609
- **Hosted CMS:** https://epiphanyeden.org/admin
- **Production branch:** `main`
- **Integration branch:** `develop`
- **Documentation reviewed:** October 3, 2026

This README combines the current repository implementation with decisions recorded in the New Church Website project conversations. This update was checked against develop commit `dabd518a7b75190da7c352786f8af712fb1b811e`. Netlify account settings, environment values, build-hook branch, TinaCloud settings, and external service ownership must be checked in their respective dashboards; they are not all represented in Git.

## 1. Stack and architecture

| Layer | Implementation | Purpose |
| --- | --- | --- |
| Website | Astro `^7.3.2`, TypeScript `^6.0.3`, Astro templates and CSS | Build the parish pages and shared design. |
| Content editor | TinaCMS `^3.14.0`, CLI `^3.0.0`, TinaCloud | Give editors forms and visual editing; save content to GitHub. |
| Astro/Tina bridge | `@tinacms/astro ^0.7.0` | Connect Tina data, field markers, and editing islands. |
| CMS custom screens | React / React DOM `^19.2.7` | Provide Publish Website and View Website inside Tina. |
| Source control | Git / GitHub | Store code, JSON content, media, branches, and change history. |
| Hosting | Netlify, `@astrojs/netlify ^8.2.6` | Build and serve the site and deploy server functions. |
| Runtime | Node 22; `.nvmrc` specifies `22.22.0` | Match local and hosted builds. |
| Image processing | Sharp `^0.35.4` in Node | Generate smaller WebP copies of uploaded raster images before Tina/Astro builds. |
| Search discovery | `@astrojs/sitemap ^3.7.4`, generated SEO metadata, Google Search Console | Publish crawl/indexing signals and monitor Google search visibility. |
| Visitor measurement | Google Analytics 4 (GA4) | Measure production website visits and supported interactions. |

These are package.json version ranges; package-lock.json records the installed versions.

Astro uses `output: 'static'`, and ordinary public pages are generated at build time. The site is **not entirely static infrastructure**: Tina visual editing uses a server endpoint at `/tina-island/[name]`, publishing uses a Netlify function, and the legacy Contact redirect runs as a server route. The Netlify adapter supports this combination.

There is no application database configured in this repository. Content lives in JSON files; media lives in Git. Pledge responses and subscriptions belong to the external services listed below.

The usual flow is:

1. A developer changes code, or an editor changes content in Tina.
2. GitHub stores the change.
3. Netlify optimizes uploaded images with Sharp, then builds the chosen branch with Tina's CLI followed by Astro.
4. Netlify serves the generated site and functions.

**A Tina Save and a live publication are separate operations.** A normal developer push/merge to main can also publish previously saved Tina content. Saved content is not isolated in a separate draft store.

## 2. Repository map

| Path | Responsibility |
| --- | --- |
| `content/site/site.json` | Shared parish details, SEO description, header/navigation/submenus and buttons, footer settings and links. |
| `content/site/home.json` | Homepage hero, quick links, welcome/worship/outreach copy, Sunday service card, closing copy. |
| `content/pages/*.json` | Page titles, header images/alt text, introductions, summary cards, and text sections. |
| `content/events/*.json` | Individual events, dates, display times, photos, homepage feature flag, optional links. |
| `content/ministries/*.json` | Ministry records, descriptions, images, feature flags, sort order. The collection remains even though Serve's three ministry boxes were removed. |
| `src/pages/` | Astro routes and page-specific external integrations. |
| `src/pages/about/[slug].astro` | Generates About subpages from `about-*.json`; e.g. `about-history.json` becomes `/about/history`. |
| `src/pages/events/index.astro`, `[slug].astro` | Event listing and detail routes. |
| `src/pages/contact.astro` | Legacy Contact route redirects to Connect. |
| `src/layouts/BaseLayout.astro` | HTML shell, metadata, favicon, header/footer, global CSS. |
| `src/layouts/ContentPage.astro` | Shared Tina-enabled page layout. |
| `src/components/Header.astro`, `Footer.astro`, `ContactCards.astro` | Shared navigation, footer/map, and clickable phone/email/location cards. |
| `src/components/islands/` | `HomeBody.astro`, `ContentBody.astro`, `EventBody.astro`: rendered content with Tina field markers. |
| `scripts/optimize-images.mjs` | Build-time Sharp processing for JPG/JPEG/PNG uploads; creates adjacent WebP copies. |
| `src/lib/images.ts`, `src/components/OptimizedImage.astro` | Select generated WebP files for built pages and retain original-image fallbacks. |
| `src/components/GoogleAnalytics.astro` | Production-only Google tag for the church's GA4 web stream. |
| `src/lib/seo.ts`, `src/pages/robots.txt.ts` | SEO URL/description/schema helpers and generated crawler rules. |
| `public/google*.html` | Google ownership verification files; preserve them through commits and deployments. |
| `src/lib/content.ts` | Direct JSON loading, date formatting, event and ministry ordering. |
| `src/lib/tina-data.ts` | Generated Tina client queries with editing metadata. |
| `src/lib/islands.ts` | Registry mapping home/page/event editing islands to queries and components. |
| `src/pages/tina-island/[name].ts` | Dynamic Tina island endpoint; inspect when visual editing fails. |
| `src/styles/global.css` | Typography, color, spacing, responsive layout, image presentation. |
| `tina/config.ts` | Tina schema, branch selection, media storage, editor routes, custom screens. |
| `tina/PublishSite.tsx`, `ViewWebsite.tsx` | Custom CMS navigation screens. |
| `netlify/functions/publish-site.mjs` | Authenticated server-side request to the Netlify build hook. |
| `public/images/uploads/` | Tina media, including uploaded documents/PDFs; public URL begins `/images/uploads/`. |
| `public/favicon.ico`, `favicon.svg` | Favicon assets; BaseLayout currently references the ICO. |
| `public/admin/` | Generated Tina admin output; generated HTML/assets are ignored. |
| `tina/__generated__/` | Generated client/schema output, ignored by Git. |
| `tina/tina-lock.json` | Tracked Tina schema lock/snapshot. Regenerate through Tina tooling when needed. |
| `enable-epiphany-visual-editing.mjs` | Historical migration/helper script. Inspect before use; it is not an npm build step and should not be rerun casually. |
| `SETUP-CHECKLIST.md` | Original startup checklist. Some instructions predate this handoff; follow this README for the established repository. |

Core routes include `/`, `/welcome`, `/about`, `/about/history`, `/about/diocese`, `/about/beliefs`, `/about/leadership`, `/worship`, `/connect`, `/serve`, `/events`, `/give`, `/pledge`, and `/text-signup`.

Adding a navigation link does not create a page. Ordinary new routes require code and matching content; About subpages use the existing dynamic route. Tina currently disables creation/deletion for the Pages collection, so developers add those files.

## 3. Configuration inventory

Review these before changing hosting, domains, schemas, dependencies, or branch workflows.

| File | Why review it |
| --- | --- |
| `package.json` | Commands, dependency ranges, ESM mode, Node minimum `>=22.22.0`. There is no test/lint/check script currently. |
| `package-lock.json` | Reproducible npm dependency graph; commit intentional updates alongside package.json. |
| `.nvmrc` | Pins the local Node version to `22.22.0`. |
| `astro.config.mjs` | Public SEO origin uses `SITE_URL`, defaulting to `https://epiphanyeden.org`; Netlify `URL` is not a fallback. Generates sitemaps with `@astrojs/sitemap`. Static output, Netlify adapter, no trailing slashes, Tina integration/Vite plugin, SSR package handling. Local Edge emulation is disabled because it caused development errors. |
| `netlify.toml` | `npm run build`, publish `dist`, Node `22`, Tina-save ignore rule, and security headers. TOML/shell quoting is significant. |
| `tina/config.ts` | All editable fields and collections, admin output, media paths, branch environment precedence, editor routing and plugin registration. A schema change must match content and rendering. |
| `tina/tina-lock.json` | Generated schema snapshot; keep consistent with schema changes. |
| `tsconfig.json` | Extends Astro strict configuration; enables JSON imports and JavaScript; excludes dist. |
| `prettier.config.cjs` | Formatting conventions. Prettier is not listed as a project dependency; use an appropriately configured editor/tool rather than assuming an npm format command exists. |
| `.gitignore` | Keeps env files, generated Tina output, node_modules, build output, Astro and local Netlify files out of Git. |
| `public/admin/.gitignore` | Ignores generated admin index and assets; rebuild rather than manually editing them. |

No tracked `.env.example`, GitHub Actions workflow, or `AGENTS.md` was present in the reviewed tree. The old README's instruction to copy `.env.example` was stale.

### Environment variables

Create an ignored local `.env` yourself when cloud-connected local builds are needed:

```dotenv
PUBLIC_TINA_CLIENT_ID=your-project-client-id
TINA_TOKEN=your-read-only-tina-token
SITE_URL=https://epiphanyeden.org
```

| Variable | Where / why |
| --- | --- |
| `PUBLIC_TINA_CLIENT_ID` | Local/cloud builds and publish function. Identifies the Tina project; not a secret. |
| `TINA_TOKEN` | Cloud-connected builds. Read-only Tina token; treat it as a secret. |
| `SITE_URL` | Astro's public SEO origin. Set `https://epiphanyeden.org` in all Netlify deploy contexts, including previews and branch deploys. This does not change where a preview is hosted. |
| `NETLIFY_BUILD_HOOK_URL` | Secret Netlify runtime setting for publish-site. Must reach the deployed function, not just the build process. Hook should target main. Do not put it in public variables or commit it. |
| `HEAD` | Tina's first branch selector; normally supplied by Netlify. |
| `VERCEL_GIT_COMMIT_REF` | Second branch fallback retained in code; this does not mean the site is hosted on Vercel. |
| `GITHUB_BRANCH` | Third branch fallback; useful to explicitly select a cloud-connected local build's branch. |
| `CONTEXT` | Supplied by Netlify. Analytics requires `production`; do not override preview contexts to enable tracking. |
| `URL` | Netlify-provided hosting URL; not used as Astro's public SEO origin. |

Tina branch precedence is `HEAD → VERCEL_GIT_COMMIT_REF → GITHUB_BRANCH → main`. A local Git checkout alone does not change that fallback. For cloud-connected local builds, deliberately select the correct branch and ensure it is indexed in TinaCloud.

The current implementation has **no separate publish-bypass environment variable**. Netlify build-hook deploys bypass the ignore command; the server function supplies the hook request.

Do not commit `.env`, tokens, or generated Tina clients. Earlier project discussions identified a generated-client token exposure; the current ignore rule prevents tracking new generated output. Verify the previously exposed token was rotated; ignoring a file does not remove old Git history.

## 4. Local development in VS Code

You need Git, Node/npm, repository write access, and VS Code. Developers managing cloud settings also need the existing Netlify and TinaCloud projects. Do not create replacement accounts/projects simply to make a local checkout work.

```bash
git clone https://github.com/EpiphanyEdenNC/EpiphanyWebsite202609.git
cd EpiphanyWebsite202609
nvm use
npm ci
npm run dev
```

If nvm is unavailable, install/use Node 22.22.0 or a compatible version satisfying package.json. Open this cloned folder in VS Code; do not initialize a new repository or publish a duplicate to a personal GitHub account.

- Website: `http://localhost:4321`
- Editor: `http://localhost:4321/admin`
- Redirects to an admin index/hash route are normal.
- Local Tina development writes files in the working tree; commit them yourself.
- Hosted Tina uses authentication and saves through TinaCloud/GitHub.

| Command | Use |
| --- | --- |
| `npm run dev` | Runs Tina development server and Astro together; does not run the image optimizer automatically. |
| `npm run build:local` | Image optimization, local schema/client generation, and Astro build without cloud checks. Useful for local validation; does not prove cloud indexing/authentication works. |
| `npm run build` | Production command: `npm run optimize-images && tinacms build --content=local --verbose -c "astro build"`. Reads checkout content but still checks TinaCloud. Needs valid project configuration/credentials. |
| `npm run optimize-images` | Generates WebP copies without running Tina or Astro. |
| `npm run preview` | Astro preview of built output. Does not replace Netlify validation of runtime functions. |

There is no automated test suite declared. For a feature, run an appropriate build and inspect affected pages on desktop/mobile. Check links, navigation/submenus, images, line breaks, and Tina fields. Validate server functions and hosted editing in a Netlify environment where they are available.

## 5. Git workflow and deployment

### Branch roles

- `main`: production source. Normal Git-triggered builds from this branch publish through Netlify.
- `develop`: accumulate reviewed work before a deliberate production release.
- `feature/<description>`: one scoped change, normally based on current develop.

Compare develop with main before starting new work. The original handoff found develop behind main, but subsequent feature merges have changed that state. Use the fast-forward sync below only when develop has no commits of its own to preserve.

With a clean working tree:

```bash
git fetch origin
git switch develop
git pull --ff-only origin develop
git merge --ff-only origin/main
git push origin develop
git switch -c feature/describe-the-change
```

The fast-forward sync is appropriate for a behind-only state. If develop acquires its own commits, review/merge divergence normally; do not reset or force-push away work.

### Edit, review, and release

1. Fetch/pull current changes. Tina may have written new content directly to main since your last checkout.
2. Create the feature branch; make code/content changes in VS Code.
3. Validate locally and inspect the diff. Include the matching Tina schema, templates, content, and lock changes when relevant.
4. Stage intended files, commit, and push:
   ```bash
   git status
   git add path/to/changed-file
   git commit -m "Describe the change"
   git push -u origin feature/describe-the-change
   ```
5. Open a GitHub PR with **base develop** and **compare feature/describe-the-change**. Review and merge it.
6. Test develop locally or through a configured Netlify branch deployment. A public preview can let reviewers inspect the website without GitHub/Netlify logins, provided deploy protection permits it.
7. Before release, incorporate recent main/Tina changes into develop and resolve any content conflicts carefully.
8. Open a PR with **base main** and **compare develop**. Review the full release diff, then merge.
9. GitHub's merge updates main; Netlify's connected repository integration starts the production build.
10. Confirm successful deployment and the expected commit in Netlify, then inspect the live pages and admin.
11. Sync develop and local checkouts with the new main before starting the next feature.

A local commit does not reach Netlify until it is pushed. Merging a PR to main creates/updates production history; normally there is no need to edit directly on local main. A deliberately authorized direct push to main has the same deployment consequence.

In VS Code, the branch selector controls the checkout; Source Control stages/commits files; Push/Publish Branch sends the branch to origin. GitHub Desktop can perform the same operations. Always verify the remote is the church repository.

Netlify branch deploys and deploy previews are dashboard choices, not established by netlify.toml. Enable only what reviewers need to control build usage. Review preview authentication and environment contexts; production secrets and a production publish hook should not be casually shared with preview environments.

After a feature is merged and no longer needed, delete its remote/local branch. GitHub's “active” label is not proof that it remains unmerged. Check PR history/diffs; squash merges may not appear as Git ancestry merges.

### Rollback

For an urgent hosted regression, a Netlify administrator can restore a known-good deploy. Then fix/revert the source through Git so a later build does not reintroduce the problem. Prefer a revert commit/PR to rewriting shared main history. Publishing again builds the latest branch state, not necessarily the restored deploy's source.

## 6. Tina editing and publication

### What editors can change

Tina exposes Site Settings, Homepage, Pages, Events, and Ministries. This includes editable navigation/submenus and button visibility, footer/map settings, homepage quick-link items, page banners and introductions, and the Sunday service card.

Sunday service fields include priest photo, heading, date/time text, optional location, Sunday name, priest name/bio, Order of Service and Music PDFs, and optional additional information. It is manually maintained; it is not an automatic weekly scheduler.

Layouts, responsive behavior, CSS, routes, and external embed code remain developer responsibilities. A textarea enables newlines in the editor; the template/CSS must also preserve them where desired. Review global.css and the relevant component when text displays as one line.

### Save versus Publish Website

1. Sign in at the hosted admin as an authorized TinaCloud collaborator.
2. Edit and **Save** each changed document.
3. Tina commits the saved content to its configured GitHub branch.
4. Netlify's ignore command skips an automatic Git-triggered build when the latest commit message is exactly `TinaCMS content update`. A rapidly canceled build for that save is expected.
5. Use **Publish Website** (called “Publish to Live” in earlier discussions) after finishing saves.
6. The custom screen sends an authenticated POST to `/.netlify/functions/publish-site`.
7. The function verifies the Tina bearer session against the configured project's current-user endpoint, then posts to the secret Netlify build hook.
8. Netlify builds the hook's configured branch. A successful CMS message means the build was requested, not that deployment has finished.
9. Use **View Website** to return to the site's root and inspect after deployment.

Saved changes survive logging out or closing the browser; you can return later to publish. Unsaved editor changes do not have that guarantee. Publishing includes all saved changes on the hook branch, including those from other editors.

This is a lightweight publication control, **not a separate draft/approval branch system**. A developer merge to main can publish saved content too. A preview admin may target a different Tina branch, but the publish function uses a fixed hook and does not automatically publish whichever branch is open in the editor. Keep the production hook correctly targeted and restrict preview publishing configuration.

### TinaCloud setup and domain changes

In the existing TinaCloud project, verify:

- GitHub integration has access to the church repository.
- main and any branches used for cloud-connected editing/builds are indexed.
- Client ID/token match Netlify's environment settings.
- Collaborators can sign in and edit.
- Configuration → Site URL(s) includes `https://epiphanyeden.org`, the retained Netlify origin, and appropriate local/preview origins.

The domain moved to the new website on October 3. The reported error, “Your TinaCloud config is missing for domain,” points to TinaCloud's allowed Site URLs. Add the exact origin there; an allowlist-only correction should not require a code change or redeploy. Separately review SITE_URL when changing the site's canonical origin.

Schema changes need more than a local form edit: build/regenerate Tina output, commit intentional schema/lock/content/template changes, and let TinaCloud index the target branch. The project previously hit a schema mismatch when a new header type was not yet indexed on main.

### Events: precise behavior

- `src/lib/content.ts` sorts events chronologically; ordering the Tina document list does not define website order.
- Homepage considers featured events and shows up to three dated today or later.
- Browser JavaScript compares calendar dates against today in `America/New_York`. The free-form display time is ignored.
- An October 5 event remains eligible throughout October 5 and is hidden on October 6.
- This browser filtering avoids needing a new Netlify build every midnight. With JavaScript disabled, the generated featured cards are not filtered by that script.
- All events remain on the Events page until deleted, including past events.
- Event URLs use the JSON filename-derived routeSlug; the separate slug field is used during creation but does not automatically rename an existing file/URL.
- “All Events →” below the homepage cards provides another route to the full list.

## 7. External interfaces and services

| Service | Integration / owner responsibilities |
| --- | --- |
| Tally | `src/pages/pledge.astro` embeds form `dWrO4r` with its hosted widget script/dynamic height. Pledge intro/banner are editable in Tina; form questions, response access, notifications, and retention are managed in Tally. Changing the embed requires code. |
| Tithely | `site.givingUrl` drives Give Online. Handles donations outside this application; Tina can update the destination. |
| Mailchimp | Header/footer link to hosted email signup. The list, signup behavior, and campaigns are managed in Mailchimp. No Mailchimp API integration is configured here. |
| TextMagic | `src/pages/text-signup.astro` loads the subscribe widget; widget code is in the route. Page text and header signup button are editable in Tina; subscriber management is in TextMagic. |
| Google Maps | Footer displays a map and directions based on site settings/address. Review Footer.astro for fallback map URL construction; no Maps API key is configured in the reviewed source. |
| YouTube / Facebook / Instagram | Links in content/site settings. Streaming is external; the site does not run OBS or publish streams. Worship currently points users to YouTube. |
| Google Analytics | Sign in at https://analytics.google.com/ using **the Epiphany Google/gmail account**. GA4 reports website visits and interactions; the site sends production-only data through its Google tag. See the Google tools section below. |
| Google Search Console | Sign in at https://search.google.com/search-console using **the Epiphany Google/gmail account**. Monitor Google search visibility, indexing, and sitemap processing. Ownership is verified with an HTML file in `public`. See the Google tools section below. |
| Book of Common Prayer online | Worship includes a red Book of Common Prayer button linking to https://www.bcponline.org/. |

External scripts may be blocked by browser extensions or service outages. Test signup/pledge rendering on the deployed site; account-side changes can affect behavior without a Git commit. Coordinate any real test submission with the service owner.

Maintain church-controlled access to GitHub, Netlify, TinaCloud, Tally, Mailchimp, TextMagic, Tithely, Google Analytics, Google Search Console, and domain/DNS management. For both Google reporting tools, use **the Epiphany Google/gmail account**, not a developer's personal account. Store credentials in approved account/password management, not this README.

## 8. Project decisions and reasons

The following summarizes the project conversations, with implementation checked against the reviewed source.

| Decision | Reason / consequence |
| --- | --- |
| Replace the older Gatsby workflow with Astro and Tina | Reduce maintenance complexity and make content editing practical for non-developers. Keep hosting economical. |
| Keep Netlify and the existing free legacy plan | Preserve the established deployment setup and avoid unnecessary hosting cost. Plan limits are account-specific and should be checked. |
| Use a long-lived develop branch and feature branches | Batch changes for review and merge to production less frequently; keep isolated changes understandable and reduce unnecessary builds. |
| Give routine editors Tina login rather than GitHub/Netlify duties | Editors should update parish information without learning Git or deployment dashboards. |
| Add Save/Publish separation | Avoid a full production build after every content save and give editors a deliberate publishing action. This workflow was confirmed working in September. |
| Add View Website and a publication reminder | Make it clear how to exit the CMS and that Save alone does not update the public site. |
| Enable Astro/Tina visual editing | Provide field-aware editing while keeping normal page output mostly static. Local Edge emulation was disabled after development errors. |
| Put shared header/footer settings and quick links in Tina | Let editors update labels, links, visibility, and selected content blocks without code changes. |
| Merge Contact content into Connect | Remove overlapping destinations; provide phone/email/map cards and church-office information together. Preserve the old Contact route by redirect. |
| Add dedicated Give and Pledge destinations | Separate donation processing from recording an annual pledge; make both accessible from header/footer. |
| Choose Tally over custom SendGrid/EmailJS pledge handling | Reduce setup and ongoing maintenance; manage the form and responses in a hosted form service. |
| Add Sunday service details and PDF links | Keep weekly presider/worship information together and editable for a parish using supply clergy. |
| Retain historical events on Events; hide past dates only on home | Keep records available while the homepage stays focused on upcoming activity. Use dates only because time is free-form. |
| Add About submenus and linked overview cards | Organize History, Diocese, Beliefs, and Leadership without crowding the main navigation. |
| Remove Serve's three bottom boxes | Follow the requested simpler page presentation; the underlying ministry collection remains available. |
| Retain verbose production Tina build logging | Investigate intermittent indexing delays. A roughly 29-second cloud check completed successfully; the user chose to monitor patterns before further changes. |
| Keep cloud validation in production | Local content indexing does not eliminate TinaCloud schema/index checks; local bypass builds are for development validation. |
| Use modern, warm, inviting visuals | Establish the parish's own presentation; avoid clip art. Earlier comparison to St. Mary's Asheville was a design reference, not a license to copy their text/assets. |

Image cropping questions led to two separate changes: generate WebP copies in Node/Netlify for performance, and use `object-fit: contain` for page header images so the entire image is visible. Page headers have a 3:1 frame; wide images of approximately that shape give the best results. The homepage hero and other image classes retain their own CSS fit behavior. There is no universal Tina image-fit selector. See Image processing and presentation below.

## 9. Set up ChatGPT/Codex for repository changes

Repository access and a working build environment are separate capabilities. Being able to search/read GitHub does not establish permission to write files, create branches, or open PRs.

### Connected GitHub workflow

1. Use a ChatGPT/Codex surface offering the GitHub connection/plugin and repository write actions.
2. Connect the GitHub account that has access to `EpiphanyEdenNC/EpiphanyWebsite202609`.
3. In GitHub's app authorization/installation, include this repository. If organizational approval is required, have the organization owner grant it.
4. Confirm both the human account's repository role and the app's allowed actions support the intended work. Do not assume access to a personal repository grants access to the church repository.
5. Supply the exact repository name, starting branch, target branch, requested outcome, and merge/deployment authorization.
6. Ask the agent to read README, current files, and branch differences before changing anything. Start from up-to-date develop or deliberately use main for an isolated fix.
7. Have it create a feature branch, make the scoped change, validate where it has an execution environment, and open a PR.
8. Review the PR and merge through the workflow above. Require an explicit report if builds or hosted checks could not be performed.

For a build-capable cloud task, select/create a cloud environment with this repository, Node 22.22.0, and `npm ci`. Provide required secrets through environment settings, not chat text; enable necessary dependency/Tina network access. Without Tina credentials, use build:local and separately verify the production build in Netlify.

Alternatively, use Codex with the existing local checkout in VS Code/CLI and authenticated Git. The agent can edit local files and run commands; GitHub pushes still need your Git authentication/authorization. A GitHub connection does not automatically give access to your computer, Netlify dashboard, or TinaCloud dashboard.

Official setup guidance:
- [Cloud environments](https://learn.chatgpt.com/docs/environments/cloud-environments)
- [ChatGPT/Codex configuration](https://learn.chatgpt.com/docs/configuration)

### Suggested request

> Work in EpiphanyEdenNC/EpiphanyWebsite202609. Read README.md and the current implementation. Compare develop with main and bring the starting point current without discarding work. Create feature/describe-the-change from develop. Implement [specific change], including Tina schema and template changes where needed. Inspect the diff, run the available appropriate build, and open a PR targeting develop with validation results. Do not merge or deploy.

Change the final instruction when you deliberately authorize merging/releasing. Name a GitHub account if multiple connections are available. Project conversation context helps explain intent, but current files remain authoritative.

An optional future AGENTS.md could record these branch, build, schema, and release rules for coding agents. It is not currently part of this repository.

## 10. Troubleshooting and maintenance

| Symptom | First checks |
| --- | --- |
| Tina reports missing config for domain | Add the exact origin to TinaCloud Site URL(s), then retry login. |
| Tina schema mismatch | Verify project ID/token, selected branch, schema/lock consistency, and branch indexing in TinaCloud. |
| Build appears stuck at indexing | Read verbose logs; distinguish local indexing from cloud validation. Do not assume a 20–30-second check is failure or remove production checks to conceal it. |
| Tina Save causes a rapid canceled deploy | Expected if the latest message exactly matches the ignore rule. |
| Tina Save unexpectedly produces a full deploy | Inspect the actual latest commit message and current netlify.toml. The match is exact, not a general “all CMS commits” rule. |
| Publish says not configured | Check PUBLIC_TINA_CLIENT_ID and secret NETLIFY_BUILD_HOOK_URL in the deployed function's environment/scope. |
| Publish cannot verify session | Sign in again; inspect project ID and function logs. |
| Publish reports success but site is unchanged | Check Netlify build result, hook target branch, latest saved commit, and deploy status. |
| Local preview cannot publish | Plain Astro development/preview is not the deployed Netlify function environment. Validate in Netlify or a properly configured Netlify local environment. |
| Event order differs from Tina's list | Inspect dates and featured flags; website order is computed from content. |
| Old event still on home | Check date format and New York calendar day, browser JavaScript, and whether the current template was deployed. |
| Media is cut off | Check component CSS, intended aspect ratio, object/background fit, and SVG viewBox. |
| Newlines disappear | Check both textarea schema and renderer/CSS whitespace behavior. |
| GitHub mergeability indicator stalls | Refresh and inspect actual conflicts/checks; an earlier project incident cleared after refresh. |
| Changes are in the wrong repository/branch | Check origin URL, current branch, PR base/head, and the connected account. |

Before a handoff or dependency upgrade, verify one full production build, hosted Tina login, a controlled Save/Publish cycle, and the affected external links/widgets. The current README work changes documentation only; no new runtime behavior is introduced.

Keep schema, content, and rendering changes together. Avoid editing generated admin/client output manually. Review the stale SETUP-CHECKLIST before treating it as current instructions. One minor source inconsistency to review later: BaseLayout references favicon.ico while declaring an SVG MIME type.

## 11. Technical SEO

Astro generates SEO metadata during each build; Tina editors continue using the existing title, introduction, header image, event, and Site Settings fields. These changes do not alter page appearance.

- `astro.config.mjs` uses `SITE_URL` (default `https://epiphanyeden.org`) as the public origin. Set it to the production custom domain, including in preview build contexts. Netlify's temporary `URL` is deliberately not used for canonical URLs. Keep the existing `trailingSlash: 'never'` convention.
- `@astrojs/sitemap` generates `sitemap-index.xml` and its linked sitemap files, including individual event and About pages. Admin routes, Tina island endpoints, the `/contact` redirect, and 404 are excluded automatically.
- `src/pages/robots.txt.ts` generates robots rules and the sitemap URL from the same Astro site origin. `netlify.toml` additionally sends `X-Robots-Tag: noindex, nofollow` for Tina admin and island endpoints.
- `src/layouts/BaseLayout.astro` supplies canonical URLs, descriptions, Open Graph and Twitter card metadata, and Church JSON-LD. `src/lib/seo.ts` normalizes URLs, bounds descriptions, and safely serializes JSON-LD.
- Content pages use their introduction and header image. Event pages use the summary and event image. The homepage hero is the fallback sharing image. Images in social metadata reference original uploads, so they do not depend on the optimization manifest and can be used by sharing crawlers.
- Church identity, contact information, full address, and social profiles come from existing Site Settings. The address remains the editable full-address string rather than duplicating it in hard-coded structured fields.
- Individual event pages also emit Event JSON-LD. Start dates match the date displayed in Eastern time; the free-form `time` field is deliberately not interpreted as a timestamp. Only known location information is emitted. Missing/invalid dates omit Event JSON-LD. This is descriptive schema, not a guarantee of Google event rich-result eligibility; complete venue addresses and structured start/end times would be needed to improve eligibility.
- The homepage title includes Episcopal church and Eden, NC. Welcome and Worship have descriptive search titles; their visible headings remain controlled by Tina. Other page titles continue using Tina content.

Search Console ownership has been verified with an uploaded HTML file. Preserve the tracked `public/google*.html` verification files. Sign in using **the Epiphany Google/gmail account** and submit `https://epiphanyeden.org/sitemap-index.xml`. Search Console reporting and Google Business Profile management are external account tasks, not part of the build. Check that the public address, phone number, and website agree with the church's Business Profile. SEO head metadata updates after publishing and rebuilding; Tina's live body preview does not rewrite the document head.

For local verification, run `npm run build:local` and inspect `dist/sitemap-index.xml`, `dist/sitemap-0.xml`, `dist/robots.txt`, and the generated page HTML for canonical, social, and JSON-LD metadata. Production deploys still use the existing Tina Save/Publish workflow.

## 12. Google reporting tools and church account access

**Logon for both Google Analytics and Google Search Console: the Epiphany Google/gmail account.** Use the church account to access the existing website property and reports. If a tool shows an empty setup screen, first check the signed-in Google account and selected property; do not create a duplicate property under a personal account. Keep passwords and recovery information in the church's approved account/password management, not Git or this README.

| Tool | Where to sign in | What it tells you |
| --- | --- | --- |
| Google Analytics 4 (GA4) | https://analytics.google.com/ | How visitors reach and use the site: traffic sources, page visits, and interactions supported by the configured measurement settings. |
| Google Search Console | https://search.google.com/search-console | How the site performs in Google Search: search queries, impressions, clicks, indexed pages, and crawl/sitemap problems. |

The tools are separate. Search Console works without Analytics, and an Analytics tag is not needed for the site's existing HTML-file ownership verification.

### Google Analytics implementation and checks

`src/components/GoogleAnalytics.astro`, included once in the shared `BaseLayout.astro` head, installs the Google tag for GA4 web stream `G-M8JCF6ZVJ5`. The measurement ID is public configuration, not a secret. Update both occurrences in this component if the church changes Analytics properties.

Tracking is enabled only when Astro is building for production and Netlify's built-in `CONTEXT` equals `production`. A browser hostname guard also limits collection to `epiphanyeden.org` and `www.epiphanyeden.org`. Local development, branch deploys, deploy previews, and the standalone Tina admin interface do not initialize this tag. `SITE_URL` is not used to decide whether Analytics runs, because previews also use the production SEO origin.

Deploy through the normal develop-to-main workflow, then visit the live website and check Analytics Realtime or Google's Tag Assistant. Browser privacy settings and blockers can prevent collection. This installs the standard Google tag; enhanced measurement settings remain managed in the Google Analytics web stream. No additional custom events or Tag Manager container are installed.

### Google Search Console operation and checks

Search Console ownership was verified by uploading Google's HTML verification file into `public`. Astro copies that file to the website root during deployment. The repository currently contains `public/google2eeeed46cd4ef1d0.html` and `public/googlec4edbeb32a0fdea7.html`; retain the verification files and their contents. Do not rename or delete them during cleanup, and keep them committed so future deploys preserve verification.

Using **the Epiphany Google/gmail account**, select the existing property for the production website. In Sitemaps, submit `https://epiphanyeden.org/sitemap-index.xml` (or `sitemap-index.xml` when the interface already supplies the site prefix). Astro regenerates the index and linked sitemap automatically when routes or event files change; do not maintain the XML by hand.

If Search Console reports “Couldn't fetch”:

1. Open https://epiphanyeden.org/sitemap-index.xml and the sitemap it links to, normally https://epiphanyeden.org/sitemap-0.xml. Both must be publicly accessible XML.
2. Inspect the URLs inside them. They must start with `https://epiphanyeden.org`, not the temporary Netlify hostname.
3. Check `SITE_URL=https://epiphanyeden.org` in all Netlify deploy contexts. Changing an environment value requires a fresh production build/deploy to update generated files.
4. Confirm the SEO changes reached main and the production deploy succeeded, then retry the sitemap submission.

Sitemap submission does not guarantee immediate indexing. Search Console reporting and Google's recrawling can take time, especially after replacing the old website. Use URL Inspection to examine a specific production URL and request indexing when appropriate. Analytics data collection is separate from this process.

## 13. Image processing and presentation

The site now optimizes uploaded images automatically in **Node during the Netlify build**, using Sharp. Tina continues to store and edit the original uploads. Editors do not need to create WebP files or replace image links themselves.

### Processing pipeline

`npm run build` and `npm run build:local` first run `npm run optimize-images`, which executes `scripts/optimize-images.mjs`.

| Setting / behavior | Current implementation |
| --- | --- |
| Input folder | `public/images/uploads/`, including subfolders. |
| Supported inputs | JPG, JPEG, and PNG, matched case-insensitively. |
| Output | An adjacent WebP copy with the original extension retained, e.g. `photo.jpg.webp`. |
| Maximum width | 1800 pixels; smaller images are not enlarged. Height scales proportionally. |
| Orientation | Sharp auto-orients from image metadata before resizing. |
| WebP encoding | Quality 82, effort 4. |
| Source preservation | Original uploads remain unchanged and available as fallbacks. |
| Reprocessing | An existing WebP at least as new as its source is skipped; missing or older copies are regenerated. |
| Unsupported uploads | SVG, PDF, GIF, existing WebP, and other formats are not converted by this script. |
| Error handling | An individual conversion failure logs a warning and continues; the original can still be served. A missing uploads folder skips optimization. |
| Git storage | Generated WebP files in the uploads folder are ignored by `.gitignore`; commit originals and code, not generated copies. |

The standard build makes generated files available before Astro selects image sources. `src/lib/images.ts` checks for the generated copy when building production-mode output. `src/components/OptimizedImage.astro` emits a `<picture>` with a WebP source and the original `<img>` fallback. Page headers, event cards/details, and the Sunday priest image use this component. The homepage hero uses CSS `image-set()` with an original-image fallback. Social-sharing metadata deliberately references original uploads.

### Full-image display and recommended shape

Compression/resizing and CSS fit solve different problems. Sharp reduces file dimensions and download size without cropping; CSS determines how the image occupies its frame.

The shared `.page-header-image` style in `src/styles/global.css` has a **3:1 aspect ratio** and **`object-fit: contain`**, centered. The full image scales to fit inside that frame. A differently shaped image can leave unused space. For best results, upload a wide image around **3:1**, such as 1800 × 600 pixels. SVG headers still use this presentation rule even though Sharp does not convert them.

Other image classes, including the homepage hero, use their own fit rules and can crop. For a different treatment on a particular page, review the relevant component/class and adjust CSS deliberately; there is no per-page Tina cover/contain control currently implemented.

### Tina preview and developer maintenance

Tina selects the original image, and live editor previews may show the original rather than the generated WebP. The deployed build chooses the optimized copy where available. Editors should judge the final layout after Save, Publish Website, and successful deployment. Oversized page-header images still display as the full image scaled into the header frame; matching the recommended shape improves the result.

For local work, `npm run dev` does not run the optimizer and development output uses originals. Run `npm run build:local` to validate the optimized build, or `npm run optimize-images` to generate copies independently.

After changing Sharp settings, delete the ignored generated WebP copies before rebuilding if you need existing images regenerated; the timestamp shortcut does not detect changes to width/quality settings. Check build logs for conversion warnings and inspect the resulting browser image sources. When adding a new image component, use `OptimizedImage` or the existing helper if it should participate in the optimization pipeline.
