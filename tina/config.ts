import { defineConfig } from 'tinacms';
import { PublishSitePlugin } from './PublishSite';
import { ViewWebsitePlugin } from './ViewWebsite';

const branch =
  process.env.HEAD ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.GITHUB_BRANCH ||
  'main';

export default defineConfig({
  branch,
  cmsCallback: (cms) => {
    cms.plugins.add(PublishSitePlugin);
    cms.plugins.add(ViewWebsitePlugin);
    return cms;
  },
  clientId: process.env.PUBLIC_TINA_CLIENT_ID || '',
  token: process.env.TINA_TOKEN || '',

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },

  media: {
    tina: {
      mediaRoot: 'images/uploads',
      publicFolder: 'public',
    },
  },

  schema: {
    collections: [
      {
        name: 'site',
        label: 'Site Settings',
        path: 'content/site',
        format: 'json',
        match: { include: 'site' },
        ui: {
          global: true,
          allowedActions: { create: false, delete: false },
        },
        fields: [
          {
            type: 'string',
            name: 'churchName',
            label: 'Church Name',
            isTitle: true,
            required: true,
          },
          { type: 'string', name: 'tagline', label: 'Tagline' },
          { type: 'string', name: 'address', label: 'Address' },
          { type: 'string', name: 'phone', label: 'Phone' },
          { type: 'string', name: 'email', label: 'Email' },
          { type: 'string', name: 'sundayTime', label: 'Sunday Worship Time' },
          { type: 'string', name: 'facebookUrl', label: 'Facebook URL' },
          { type: 'string', name: 'youtubeUrl', label: 'YouTube URL' },
          { type: 'string', name: 'givingUrl', label: 'Online Giving URL' },
          {
            type: 'object',
            name: 'header',
            label: 'Header Settings',
            fields: [
              {
                type: 'object',
                name: 'navigationLinks',
                label: 'Navigation Buttons (add, remove, or reorder)',
                list: true,
                ui: {
                  itemProps: (item) => ({ label: item?.label || 'New button' }),
                },
                fields: [
                  {
                    type: 'string',
                    name: 'label',
                    label: 'Button Text',
                    required: true,
                  },
                  {
                    type: 'string',
                    name: 'url',
                    label: 'Button Link',
                    required: true,
                  },
                  { type: 'boolean', name: 'hidden', label: 'Hide this menu item' },
                  {
                    type: 'object', name: 'children', label: 'Submenu Links', list: true,
                    ui: { itemProps: (item) => ({ label: item?.label || 'New submenu link' }) },
                    fields: [
                      { type: 'string', name: 'label', label: 'Link Text', required: true },
                      { type: 'string', name: 'url', label: 'Link URL', required: true },
                      { type: 'boolean', name: 'hidden', label: 'Hide this link' },
                    ],
                  },
                ],
              },
              {
                type: 'object',
                name: 'emailSignup',
                label: 'Email Signup Button',
                fields: [
                  {
                    type: 'boolean',
                    name: 'enabled',
                    label: 'Show button on every page',
                  },
                  { type: 'string', name: 'label', label: 'Button Text' },
                  { type: 'string', name: 'url', label: 'Button Link' },
                ],
              },
              {
                type: 'object',
                name: 'textSignup',
                label: 'Text Signup Button',
                fields: [
                  {
                    type: 'boolean',
                    name: 'enabled',
                    label: 'Show button on every page',
                  },
                  { type: 'string', name: 'label', label: 'Button Text' },
                  { type: 'string', name: 'url', label: 'Button Link' },
                ],
              },
              {
                type: 'object',
                name: 'giveButton',
                label: 'Give Button',
                fields: [
                  {
                    type: 'boolean',
                    name: 'enabled',
                    label: 'Show button on every page',
                  },
                  { type: 'string', name: 'label', label: 'Button Text' },
                  { type: 'string', name: 'url', label: 'Button Link' },
                ],
              },
              {
                type: 'object',
                name: 'pledgeButton',
                label: 'Pledge Button',
                fields: [
                  {
                    type: 'boolean',
                    name: 'enabled',
                    label: 'Show button on every page',
                  },
                  { type: 'string', name: 'label', label: 'Button Text' },
                  { type: 'string', name: 'url', label: 'Button Link' },
                ],
              },
            ],
          },
          { type: 'string', name: 'footerNote', label: 'Footer Message' },
          {
            type: 'object',
            name: 'footer',
            label: 'Footer Settings',
            fields: [
              { type: 'string', name: 'visitHeading', label: 'Visit Heading' },
              {
                type: 'string',
                name: 'connectHeading',
                label: 'Connect Heading',
              },
              {
                type: 'string',
                name: 'supportHeading',
                label: 'Support Heading',
              },
              { type: 'string', name: 'mapHeading', label: 'Map Heading' },
              { type: 'boolean', name: 'showMap', label: 'Show Google Map' },
              {
                type: 'string',
                name: 'mapEmbedUrl',
                label:
                  'Optional Google Maps Embed URL (paste the iframe src, not the whole iframe)',
              },
              {
                type: 'string',
                name: 'directionsLabel',
                label: 'Directions Link Text',
              },
              {
                type: 'object',
                name: 'connectLinks',
                label: 'Connect Links (add, remove, or reorder)',
                list: true,
                ui: {
                  itemProps: (item) => ({ label: item?.label || 'New link' }),
                },
                fields: [
                  {
                    type: 'string',
                    name: 'label',
                    label: 'Link Text',
                    required: true,
                  },
                  {
                    type: 'string',
                    name: 'url',
                    label: 'Link URL',
                    required: true,
                  },
                ],
              },
              {
                type: 'object',
                name: 'supportLinks',
                label: 'Give and Pledge Links (add, remove, or reorder)',
                list: true,
                ui: {
                  itemProps: (item) => ({ label: item?.label || 'New link' }),
                },
                fields: [
                  {
                    type: 'string',
                    name: 'label',
                    label: 'Link Text',
                    required: true,
                  },
                  {
                    type: 'string',
                    name: 'url',
                    label: 'Link URL',
                    required: true,
                  },
                ],
              },
              {
                type: 'string',
                name: 'copyrightText',
                label:
                  'Copyright Line (year and church name added automatically)',
              },
            ],
          },
          {
            type: 'string',
            name: 'seoDescription',
            label: 'Search Description',
            ui: { component: 'textarea' },
          },
        ],
      },
      {
        name: 'home',
        label: 'Homepage',
        path: 'content/site',
        format: 'json',
        match: { include: 'home' },
        ui: {
          router: () => '/',
          allowedActions: { create: false, delete: false },
        },
        fields: [
          {
            type: 'string',
            name: 'headline',
            label: 'Main Headline',
            isTitle: true,
            required: true,
          },
          { type: 'string', name: 'eyebrow', label: 'Small Heading' },
          {
            type: 'string',
            name: 'subheadline',
            label: 'Intro Text',
            ui: { component: 'textarea' },
          },
          { type: 'image', name: 'heroImage', label: 'Hero Photo' },
          {
            type: 'string',
            name: 'primaryButtonLabel',
            label: 'Primary Button Label',
          },
          {
            type: 'string',
            name: 'primaryButtonUrl',
            label: 'Primary Button Link',
          },
          {
            type: 'string',
            name: 'secondaryButtonLabel',
            label: 'Secondary Button Label',
          },
          {
            type: 'string',
            name: 'secondaryButtonUrl',
            label: 'Secondary Button Link',
          },
          {
            type: 'object',
            name: 'quickLinks',
            label: 'Bar Below Hero (add, remove, or reorder sections)',
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.label || 'New section' }),
            },
            fields: [
              {
                type: 'string',
                name: 'label',
                label: 'Small Heading',
                required: true,
              },
              {
                type: 'string',
                name: 'text',
                label: 'Main Text',
                required: true,
              },
              {
                type: 'string',
                name: 'url',
                label: 'Link URL',
                required: true,
              },
            ],
          },
          { type: 'string', name: 'welcomeHeading', label: 'Welcome Heading' },
          {
            type: 'string',
            name: 'welcomeText',
            label: 'Welcome Text',
            ui: { component: 'textarea' },
          },
          { type: 'string', name: 'serviceHeading', label: 'Worship Heading' },
          {
            type: 'string',
            name: 'serviceText',
            label: 'Worship Text',
            ui: { component: 'textarea' },
          },
          {
            type: 'string',
            name: 'serviceButtonLabel',
            label: 'Worship Button Label',
          },
          {
            type: 'string',
            name: 'serviceButtonUrl',
            label: 'Worship Button Link',
          },
          {
            type: 'string',
            name: 'outreachHeading',
            label: 'Outreach Heading',
          },
          {
            type: 'string',
            name: 'outreachText',
            label: 'Outreach Text',
            ui: { component: 'textarea' },
          },
          {
            type: 'string',
            name: 'outreachButtonLabel',
            label: 'Outreach Button Label',
          },
          {
            type: 'string',
            name: 'outreachButtonUrl',
            label: 'Outreach Button Link',
          },
          {
            type: 'object',
            name: 'sundayService',
            label: 'Sunday Service',
            fields: [
              {
                type: 'string',
                name: 'heading',
                label: 'Card Title',
                required: true,
              },
              { type: 'image', name: 'priestImage', label: 'Priest Photo' },
              {
                type: 'string',
                name: 'date',
                label: 'Service Date',
                required: true,
              },
              {
                type: 'string',
                name: 'time',
                label: 'Service Time',
                required: true,
              },
              {
                type: 'string',
                name: 'location',
                label: 'Location (optional)',
              },
              {
                type: 'string',
                name: 'sundayName',
                label: 'Name of the Sunday',
                ui: { component: 'textarea' },
                required: false,
              },
              {
                type: 'string',
                name: 'priestName',
                label: 'Priest Name',
                required: true,
              },
              {
                type: 'string',
                name: 'priestBio',
                label: 'Priest Bio',
                ui: { component: 'textarea' },
              },
              {
                type: 'object',
                name: 'buttons',
                label: 'Sunday Service Buttons (add, remove, or reorder)',
                list: true,
                ui: {
                  itemProps: (item) => ({ label: item?.label || 'New button' }),
                },
                fields: [
                  { type: 'string', name: 'label', label: 'Button Text', required: true },
                  {
                    type: 'image',
                    name: 'url',
                    label: 'PDF/Document (optional)',
                    description: 'Upload or select a document, or leave empty and use Website/Page Link below. Documents display before link buttons. If both fields are filled, the document is used.',
                    accept: 'document',
                  },
                  {
                    type: 'string',
                    name: 'linkUrl',
                    label: 'Website/Page Link (optional)',
                    description: 'Enter a full URL (https://...) or a page path (/worship). Leave PDF/Document empty to use this link. Fill at least one destination field for the button to appear.',
                  },
                  {
                    type: 'string',
                    name: 'style',
                    label: 'Button Style',
                    options: [
                      { label: 'Standard', value: 'standard' },
                      { label: 'Secondary', value: 'secondary' },
                    ],
                  },
                  {
                    type: 'boolean',
                    name: 'newWindow',
                    label: 'Open link in a new window',
                  },
                ],
              },
              {
                type: 'string',
                name: 'additionalInfo',
                label: 'Additional Information (optional)',
                ui: { component: 'textarea' },
              },
            ],
          },
          { type: 'string', name: 'closingHeading', label: 'Closing Heading' },
          {
            type: 'string',
            name: 'closingText',
            label: 'Closing Text',
            ui: { component: 'textarea' },
          },
        ],
      },
      {
        name: 'page',
        label: 'Pages',
        path: 'content/pages',
        format: 'json',
        match: { exclude: 'about-*' },
        ui: {
          router: ({ document }) => `/${document._sys.filename.replace(/^about-/, 'about/')}`,
          allowedActions: { create: false, delete: false },
        },
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Page Title',
            isTitle: true,
            required: true,
          },
          { type: 'string', name: 'eyebrow', label: 'Small Heading' },
          {
            type: 'image',
            name: 'headerImage',
            label: 'Header Image',
            description: 'Recommended: a wide 3:1 image, about 1800 × 600 pixels. The entire image is shown; other proportions may leave extra space around the image.',
          },
          {
            type: 'string',
            name: 'headerImageAlt',
            label: 'Header Image Description',
            description: 'Briefly describe the image for people using screen readers.',
          },
          {
            type: 'string',
            name: 'intro',
            label: 'Page Introduction',
            ui: { component: 'textarea' },
          },
          {
            type: 'object', name: 'summaryCards', label: 'Linked Summary Blocks', description: 'These link to existing destinations; they do not create pages. For About child pages, use the About Pages collection, which automatically supplies the About cards and submenu.', list: true,
            ui: { itemProps: (item) => ({ label: item?.heading || 'New summary block' }) },
            fields: [
              { type: 'string', name: 'heading', label: 'Heading', required: true },
              { type: 'string', name: 'text', label: 'Summary', ui: { component: 'textarea' } },
              { type: 'string', name: 'url', label: 'Page Link', required: true },
            ],
          },
          {
            type: 'object',
            name: 'buttons',
            label: 'Page Buttons (add, remove, or reorder)',
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.label || 'New button' }),
            },
            fields: [
              { type: 'string', name: 'label', label: 'Button Text', required: true },
              { type: 'string', name: 'url', label: 'Button Link', required: true },
              {
                type: 'string',
                name: 'style',
                label: 'Button Style',
                options: [
                  { label: 'Standard', value: 'standard' },
                  { label: 'Secondary', value: 'secondary' },
                  { label: 'Prayer Book Red', value: 'prayer-book' },
                ],
              },
              {
                type: 'boolean',
                name: 'newWindow',
                label: 'Open link in a new window',
              },
            ],
          },
          {
            type: 'object',
            name: 'sections',
            label: 'Sections',
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.heading || 'Section' }),
            },
            fields: [
              {
                type: 'string',
                name: 'heading',
                label: 'Heading',
                required: true,
              },
              { type: 'string', name: 'anchor', label: 'Optional Anchor ID' },
              {
                type: 'string',
                name: 'text',
                label: 'Text',
                ui: { component: 'textarea' },
              },
            ],
          },
        ],
      },
      {
        name: 'aboutPage',
        label: 'About Pages',
        path: 'content/pages',
        format: 'json',
        match: { include: 'about-*' },
        ui: {
          router: ({ document }) => `/about/${document._sys.filename.replace(/^about-/, '')}`,
          filename: {
            readonly: true,
            slugify: (values) => `about-${values?.urlName || 'new-page'}`,
          },
        },
        fields: [
          {
            type: 'string', name: 'urlName', label: 'URL Name', required: true,
            description: 'For example: endowment creates /about/endowment. Set this when creating the page; editing it later does not rename the existing URL.',
            ui: { validate: (value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value || '') ? undefined : 'Use lowercase letters, numbers, and single hyphens only.' },
          },
          { type: 'string', name: 'summary', label: 'About Page Summary', ui: { component: 'textarea' } },
          { type: 'number', name: 'sortOrder', label: 'Display Order', description: 'Lower numbers appear first in both the About page and submenu.' },

          {
            type: 'string',
            name: 'title',
            label: 'Page Title',
            isTitle: true,
            required: true,
          },
          { type: 'string', name: 'eyebrow', label: 'Small Heading' },
          {
            type: 'image',
            name: 'headerImage',
            label: 'Header Image',
            description: 'Recommended: a wide 3:1 image, about 1800 × 600 pixels. The entire image is shown; other proportions may leave extra space around the image.',
          },
          {
            type: 'string',
            name: 'headerImageAlt',
            label: 'Header Image Description',
            description: 'Briefly describe the image for people using screen readers.',
          },
          {
            type: 'string',
            name: 'intro',
            label: 'Page Introduction',
            ui: { component: 'textarea' },
          },
          {
            type: 'object', name: 'summaryCards', label: 'Linked Summary Blocks', description: 'These link to existing destinations; they do not create pages. For About child pages, use the About Pages collection, which automatically supplies the About cards and submenu.', list: true,
            ui: { itemProps: (item) => ({ label: item?.heading || 'New summary block' }) },
            fields: [
              { type: 'string', name: 'heading', label: 'Heading', required: true },
              { type: 'string', name: 'text', label: 'Summary', ui: { component: 'textarea' } },
              { type: 'string', name: 'url', label: 'Page Link', required: true },
            ],
          },
          {
            type: 'object',
            name: 'buttons',
            label: 'Page Buttons (add, remove, or reorder)',
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.label || 'New button' }),
            },
            fields: [
              { type: 'string', name: 'label', label: 'Button Text', required: true },
              { type: 'string', name: 'url', label: 'Button Link', required: true },
              {
                type: 'string',
                name: 'style',
                label: 'Button Style',
                options: [
                  { label: 'Standard', value: 'standard' },
                  { label: 'Secondary', value: 'secondary' },
                  { label: 'Prayer Book Red', value: 'prayer-book' },
                ],
              },
              {
                type: 'boolean',
                name: 'newWindow',
                label: 'Open link in a new window',
              },
            ],
          },
          {
            type: 'object',
            name: 'sections',
            label: 'Sections',
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.heading || 'Section' }),
            },
            fields: [
              {
                type: 'string',
                name: 'heading',
                label: 'Heading',
                required: true,
              },
              { type: 'string', name: 'anchor', label: 'Optional Anchor ID' },
              {
                type: 'string',
                name: 'text',
                label: 'Text',
                ui: { component: 'textarea' },
              },
            ],
          },
        ],
      },
      {
        name: 'event',
        label: 'Events',
        path: 'content/events',
        format: 'json',
        ui: {
          router: ({ document }) => `/events/${document._sys.filename}`,
          filename: {
            readonly: true,
            slugify: (values) =>
              values?.slug ||
              values?.title
                ?.toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '') ||
              'event',
          },
        },
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Event Name',
            isTitle: true,
            required: true,
          },
          { type: 'string', name: 'slug', label: 'URL Slug', required: true },
          {
            type: 'datetime',
            name: 'date',
            label: 'Date and Time',
            required: true,
          },
          { type: 'string', name: 'time', label: 'Display Time' },
          { type: 'string', name: 'location', label: 'Location' },
          {
            type: 'string',
            name: 'summary',
            label: 'Short Summary',
            ui: { component: 'textarea' },
          },
          {
            type: 'string',
            name: 'details',
            label: 'Full Details',
            ui: { component: 'textarea' },
          },
          { type: 'image', name: 'image', label: 'Event Photo' },
          { type: 'boolean', name: 'featured', label: 'Feature on Homepage' },
          {
            type: 'string',
            name: 'buttonLabel',
            label: 'Optional Button Label',
          },
          { type: 'string', name: 'buttonUrl', label: 'Optional Button Link' },
        ],
      },
      {
        name: 'ministry',
        label: 'Ministries',
        path: 'content/ministries',
        format: 'json',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Ministry Name',
            isTitle: true,
            required: true,
          },
          {
            type: 'string',
            name: 'summary',
            label: 'Short Summary',
            ui: { component: 'textarea' },
          },
          {
            type: 'string',
            name: 'description',
            label: 'Description',
            ui: { component: 'textarea' },
          },
          { type: 'image', name: 'image', label: 'Photo' },
          { type: 'boolean', name: 'featured', label: 'Feature on Serve Page' },
          { type: 'number', name: 'sortOrder', label: 'Sort Order' },
        ],
      },
    ],
  },
});
