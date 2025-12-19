import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'projectId',
      title: 'Project ID',
      type: 'string',
      description: 'Unique identifier (e.g., P-01, P-02)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Project name',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'focus',
      title: 'Focus Area',
      type: 'string',
      description: 'Primary focus (e.g., Product Strategy, Frontend Architecture)',
    }),
    defineField({
      name: 'keyMetric',
      title: 'Key Metric',
      type: 'text',
      rows: 2,
      description: 'Main business impact or outcome',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'Detailed project description',
    }),
    defineField({
      name: 'technologies',
      title: 'Technologies',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description: 'Tech stack used',
    }),
    defineField({
      name: 'skillsApplied',
      title: 'Skills Applied',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description: 'Skills demonstrated',
    }),
    defineField({
      name: 'organisation',
      title: 'Organisation',
      type: 'string',
      description: 'Company or context (e.g., HYRE, Sea-Watch, Personal)',
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'string',
      description: 'Year completed (e.g., 2024)',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Completed', value: 'completed'},
          {title: 'In Progress', value: 'in-progress'},
        ],
      },
      initialValue: 'completed',
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'Live demo or case study link',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'projectId',
    },
    prepare({title, subtitle}) {
      return {
        title: title || 'Untitled Project',
        subtitle: subtitle || 'No ID',
      }
    },
  },
})
