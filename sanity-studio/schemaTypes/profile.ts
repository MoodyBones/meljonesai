import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'profile',
  title: 'Profile',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Profile owner name',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'provenCapabilities',
      title: 'Proven Capabilities',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'capability', title: 'Capability', type: 'string'},
            {
              name: 'strength',
              title: 'Strength',
              type: 'string',
              options: {
                list: [
                  {title: 'High', value: 'high'},
                  {title: 'Medium', value: 'medium'},
                  {title: 'Emerging', value: 'emerging'},
                ],
              },
            },
            {
              name: 'evidence',
              title: 'Evidence (Project IDs)',
              type: 'array',
              of: [{type: 'string'}],
              description: 'e.g., P-01, P-02',
            },
            {
              name: 'themes',
              title: 'Themes',
              type: 'array',
              of: [{type: 'string'}],
              options: {layout: 'tags'},
            },
          ],
          preview: {
            select: {
              title: 'capability',
              subtitle: 'strength',
            },
          },
        },
      ],
      description: 'Capabilities ranked by evidence strength',
    }),
    defineField({
      name: 'differentiators',
      title: 'Differentiators',
      type: 'array',
      of: [{type: 'string'}],
      description: 'What sets this person apart',
    }),
    defineField({
      name: 'values',
      title: 'Values',
      type: 'array',
      of: [{type: 'string'}],
      description: 'What matters in a role',
    }),
    defineField({
      name: 'dealBreakers',
      title: 'Deal Breakers',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Non-negotiables that would reject a role',
    }),
    defineField({
      name: 'growthEdges',
      title: 'Growth Edges',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Areas of interest with less evidence (opportunities, not weaknesses)',
    }),
    defineField({
      name: 'voiceNotes',
      title: 'Voice Notes',
      type: 'object',
      fields: [
        {name: 'framing', title: 'Framing', type: 'string', description: 'How to position this person'},
        {name: 'tone', title: 'Tone', type: 'string', description: 'Writing style'},
      ],
      description: 'Guidance for content generation',
    }),
    defineField({
      name: 'lastAnalysed',
      title: 'Last Analysed',
      type: 'datetime',
      description: 'When Agent 1 last rebuilt this profile',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      lastAnalysed: 'lastAnalysed',
    },
    prepare({title, lastAnalysed}) {
      return {
        title: title || 'Unnamed Profile',
        subtitle: lastAnalysed ? `Updated: ${new Date(lastAnalysed).toLocaleDateString()}` : 'Never analysed',
      }
    },
  },
})
