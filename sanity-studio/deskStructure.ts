import {StructureBuilder} from 'sanity/structure'

export const desk = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Job Applications')
        .schemaType('jobApplication')
        .child(S.documentTypeList('jobApplication').title('Job Applications')),
      S.divider(),
      S.listItem()
        .title('Projects')
        .schemaType('project')
        .child(S.documentTypeList('project').title('Projects')),
    ])

export default desk
