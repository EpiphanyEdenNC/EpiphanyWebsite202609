# Weekly Newsletter Builder

The **Weekly Newsletter** item in Tina's Site navigation opens `/newsletter-builder`. The builder reads Sunday service content from `content/site/home.json` and upcoming events from `content/events/*.json` through the statically generated `/newsletter-data.json`.

**Important:** The newsletter data reflects the latest website deployment, not Tina changes that have only been saved but not published. Publish the website first. This is a draft creator, never an automatic sender.

## One-time Netlify setup

Add these **secret environment variables** for each Netlify site where you want to test or use campaign creation:

- `MAILCHIMP_API_KEY`: Mailchimp Marketing API key; keep it secret.
- `MAILCHIMP_AUDIENCE_ID`: the Mailchimp audience/list ID containing the newsletter subscribers.
- **Recipient tag:** The Netlify function looks up the existing Mailchimp tag by its exact name, `MainMailingList`, within the configured audience. It uses its numeric tag ID to apply a tag-specific recipient filter. No tag ID environment variable is needed. If the tag is not found, no campaign is created. Confirm the draft's recipient filter and expected contact count in Mailchimp before sending.
- `MAILCHIMP_REPLY_TO`: verified sender/reply-to email address for the Mailchimp campaign.
- `MAILCHIMP_FROM_NAME`: optional, defaults to Church of the Epiphany.
- `NEWSLETTER_EDITOR_PASSWORD`: long, unique password shared only with newsletter editors. **Not** their Tina login.
- `NEWSLETTER_SITE_URL`: optional; production defaults to `https://epiphanyeden.org` and is used for links in emails.

Never commit these values to GitHub, place them in Tina content, or expose them with a `PUBLIC_` prefix. Set different editor passwords for test and production if both connect to Mailchimp. Use a test audience or carefully identify test drafts to avoid confusion.

## Editor instructions

1. Update Sunday Service and Events in Tina.
2. **Publish Website** so the newsletter can read the current content.
3. In Tina select **Weekly Newsletter**.
4. Choose 7, 14, 30, or 90 days of events, and uncheck any items to exclude.
5. Optionally add an introduction and news announcements.
6. Review the on-page draft preview (layout is simplified).
7. Enter the newsletter editor password and choose **Create Mailchimp Draft**.
8. In Mailchimp, open Campaigns, check the recipient audience, subject, layout, content, links, and sender details, then send manually.

If a failed submission says that the draft was created but adding content failed, check Mailchimp before attempting again to avoid duplicate drafts.

## Technical notes and access

- `src/pages/newsletter-builder.astro` is a publicly loadable editor page with a `noindex` directive; the *privileged action* is protected by `NEWSLETTER_EDITOR_PASSWORD` at the server endpoint.
- `netlify/functions/mailchimp-draft.mjs` calls the Mailchimp Marketing API to create a **regular** campaign and populate HTML; it never calls the sending endpoint.
- All newsletter text is HTML-escaped in the Mailchimp template and event links are restricted to HTTPS destinations.
- A Tina login **does not** provide authentication for this separate page. A secret password is required when creating a Mailchimp draft. For more robust per-user authorization and auditing, a future version could add an identity provider.
- The browser preview is a simplified content preview; review the actual Mailchimp campaign.
- After saving a campaign, editing the website does **not** update that existing Mailchimp draft.
- Campaigns are created under the configured audience; Mailchimp manages unsubscribes and delivery.

## Local testing

The static builder preview can be tested with `npm run dev`, but Netlify Functions need a compatible local Netlify development setup (or a Netlify deploy) to test Mailchimp draft creation. Never test with the live audience without checking the Mailchimp draft before sending.

## Netlify deployment checklist

The repository's `netlify.toml` explicitly declares `[functions] directory = "netlify/functions"` with esbuild. The deployed function endpoint is `/.netlify/functions/mailchimp-draft`. No additional Netlify redirect, external plugin, or Mailchimp webhook is needed.

1. Confirm the four required environment variables above are in the **same Netlify site** as the deployment, and scoped for **Functions** if Netlify offers scope selection. Use **All scopes** if appropriate. The values are read at function runtime, so they must be available to functions, not only builds.
2. Merge the feature branch into `develop` and let the connected development Netlify site deploy (or trigger a manual deployment of that branch).
3. Under the site's **Deploys** tab, open the successful deploy and verify that the function `mailchimp-draft` is listed under **Functions/Logs**. A GET request to `/.netlify/functions/mailchimp-draft` intentionally responds 405; this confirms the function route exists without generating a campaign. A 404 means it was not deployed or routed correctly.
4. Open `/admin`, choose **Weekly Newsletter**, and check that the Sunday information and upcoming event list load. They use the latest **published** content.
5. Enter the editor password and create **one test draft**, then verify inside Mailchimp that its recipient filter is exactly `MainMailingList`, including recipient count. Never send it just to test the integration.
6. Only after passing these checks, merge `develop` to `main`, verify production Netlify variables, and run the same checks on production.

**Troubleshooting:** If the endpoint replies 503, check the Netlify environment variables and their scope. If 401, check the editor password. If 422, verify the tag's spelling and that the Audience ID is for the audience containing `MainMailingList`. A 502 usually means Mailchimp returned an error; see the response and Netlify function logs. If a draft was created but adding content failed, inspect Mailchimp before retrying.
