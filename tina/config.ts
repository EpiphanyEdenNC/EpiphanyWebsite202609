import { defineConfig } from "tinacms";

const branch =
  process.env.HEAD ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.GITHUB_BRANCH ||
  "main";

export default defineConfig({
  branch,
  clientId: process.env.PUBLIC_TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  media: {
    tina: {
      mediaRoot: "images/uploads",
      publicFolder: "public",
    },
  },

  schema: {
    collections: [
      {
        name: "site",
        label: "Site Settings",
        path: "content/site",
        format: "json",
        match: { include: "site" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "churchName", label: "Church Name", isTitle: true, required: true },
          { type: "string", name: "tagline", label: "Tagline" },
          { type: "string", name: "address", label: "Address" },
          { type: "string", name: "phone", label: "Phone" },
          { type: "string", name: "email", label: "Email" },
          { type: "string", name: "sundayTime", label: "Sunday Worship Time" },
          { type: "string", name: "facebookUrl", label: "Facebook URL" },
          { type: "string", name: "youtubeUrl", label: "YouTube URL" },
          { type: "string", name: "givingUrl", label: "Online Giving URL" },
          { type: "string", name: "mailingListUrl", label: "Email Signup URL" },
          { type: "string", name: "footerNote", label: "Footer Message" },
          { type: "string", name: "seoDescription", label: "Search Description", ui: { component: "textarea" } }
        ]
      },
      {
        name: "home",
        label: "Homepage",
        path: "content/site",
        format: "json",
        match: { include: "home" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "headline", label: "Main Headline", isTitle: true, required: true },
          { type: "string", name: "eyebrow", label: "Small Heading" },
          { type: "string", name: "subheadline", label: "Intro Text", ui: { component: "textarea" } },
          { type: "image", name: "heroImage", label: "Hero Photo" },
          { type: "string", name: "primaryButtonLabel", label: "Primary Button Label" },
          { type: "string", name: "primaryButtonUrl", label: "Primary Button Link" },
          { type: "string", name: "secondaryButtonLabel", label: "Secondary Button Label" },
          { type: "string", name: "secondaryButtonUrl", label: "Secondary Button Link" },
          { type: "string", name: "welcomeHeading", label: "Welcome Heading" },
          { type: "string", name: "welcomeText", label: "Welcome Text", ui: { component: "textarea" } },
          { type: "string", name: "serviceHeading", label: "Worship Heading" },
          { type: "string", name: "serviceText", label: "Worship Text", ui: { component: "textarea" } },
          { type: "string", name: "serviceButtonLabel", label: "Worship Button Label" },
          { type: "string", name: "serviceButtonUrl", label: "Worship Button Link" },
          { type: "string", name: "outreachHeading", label: "Outreach Heading" },
          { type: "string", name: "outreachText", label: "Outreach Text", ui: { component: "textarea" } },
          { type: "string", name: "outreachButtonLabel", label: "Outreach Button Label" },
          { type: "string", name: "outreachButtonUrl", label: "Outreach Button Link" },
          { type: "string", name: "closingHeading", label: "Closing Heading" },
          { type: "string", name: "closingText", label: "Closing Text", ui: { component: "textarea" } }
        ]
      },
      {
        name: "page",
        label: "Pages",
        path: "content/pages",
        format: "json",
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "title", label: "Page Title", isTitle: true, required: true },
          { type: "string", name: "eyebrow", label: "Small Heading" },
          { type: "string", name: "intro", label: "Page Introduction", ui: { component: "textarea" } },
          {
            type: "object",
            name: "sections",
            label: "Sections",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.heading || "Section" }) },
            fields: [
              { type: "string", name: "heading", label: "Heading", required: true },
              { type: "string", name: "anchor", label: "Optional Anchor ID" },
              { type: "string", name: "text", label: "Text", ui: { component: "textarea" } }
            ]
          }
        ]
      },
      {
        name: "event",
        label: "Events",
        path: "content/events",
        format: "json",
        fields: [
          { type: "string", name: "title", label: "Event Name", isTitle: true, required: true },
          { type: "string", name: "slug", label: "URL Slug", required: true },
          { type: "datetime", name: "date", label: "Date and Time", required: true },
          { type: "string", name: "time", label: "Display Time" },
          { type: "string", name: "location", label: "Location" },
          { type: "string", name: "summary", label: "Short Summary", ui: { component: "textarea" } },
          { type: "string", name: "details", label: "Full Details", ui: { component: "textarea" } },
          { type: "image", name: "image", label: "Event Photo" },
          { type: "boolean", name: "featured", label: "Feature on Homepage" },
          { type: "string", name: "buttonLabel", label: "Optional Button Label" },
          { type: "string", name: "buttonUrl", label: "Optional Button Link" }
        ]
      },
      {
        name: "ministry",
        label: "Ministries",
        path: "content/ministries",
        format: "json",
        fields: [
          { type: "string", name: "title", label: "Ministry Name", isTitle: true, required: true },
          { type: "string", name: "summary", label: "Short Summary", ui: { component: "textarea" } },
          { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
          { type: "image", name: "image", label: "Photo" },
          { type: "boolean", name: "featured", label: "Feature on Serve Page" },
          { type: "number", name: "sortOrder", label: "Sort Order" }
        ]
      }
    ]
  }
});
