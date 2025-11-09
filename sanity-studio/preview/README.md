This folder contains a small helper to resolve the Next.js preview URL for a Sanity document.

How to wire into Studio (example)

1. Create a custom desk structure, e.g. `deskStructure.ts`:

```ts
import S from '@sanity/desk-tool/structure-builder'
import {resolveProductionUrl} from './preview/resolveProductionUrl'

export const desk = () =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('jobApplication')
        .title('Job Applications')
        .child((id) =>
          S.document()
            .documentId(id)
            .schemaType('jobApplication')
            .views([
              S.view.form(),
              S.view
                .iframe()
                .title('Preview')
                .options({url: (doc) => resolveProductionUrl(doc)}),
            ]),
        ),
    ])

export default desk
```

2. Import and use the `desk` in `sanity.config.ts`:

```ts
import {desk} from './deskStructure'

export default defineConfig({
  // ...existing config
  tools: [structureTool({structure: desk}), visionTool()],
})
```

3. Set env vars for preview testing:

- `NEXT_PUBLIC_SITE_URL` e.g. `http://localhost:3000`
- `SANITY_PREVIEW_SECRET` (must match the one in your Next app)

Now the Studio preview pane will call the Next `/api/preview` route and open the site in Draft Mode.
