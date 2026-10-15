# Weekly Newsletter Builder

The **Weekly Newsletter** item in Tina's Site navigation opens `/newsletter-builder`. The builder reads Sunday service content from `content/site/home.json` and upcoming events from `content/events/*.json` through the statically generated `/newsletter-data.json`.

**Important:** The newsletter data reflects the latest website deployment, not Tina changes that have only been saved but not published. Publish the website first. This is a draft creator, never an automatic sender.

## One-time Netlify setup

Add these **secret environment variables** for each Netlify site where you want to test or use campaign creation:

- `MAILCHIMP_API_KEY`: Mailchimp Marketing API key; keep it secret.
- `MAILCHIMP_AUDIENCE_ID`: the Mailchimp audience/list ID containing the newsletter subscribers.
- `MAILCHIMP_TAG_ID`: **required numeric ID of the existing newsletter recipient tag (static segment)**. This is different from the audience ID and different from the tag's display name. Campaign draft creation fails closed if this setting is missing; it must never default to emailing the entire audience. Confirm the draft's recipient filter and expected contact count in Mailchimp before sending.
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
