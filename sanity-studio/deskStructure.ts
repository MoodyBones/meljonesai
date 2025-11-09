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
