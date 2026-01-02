import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'jobApplication',
  title: 'Job Application',
  type: 'document',
  groups: [
    {name: 'target', title: 'Target Role'},
    {name: 'match', title: 'Match Analysis'},
    {name: 'research', title: 'Research Context'},
    {name: 'content', title: 'Content'},
    {name: 'meta', title: 'Metadata'},
  ],
  fields: [
    // === TARGET ROLE ===
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'target',
      description: 'URL-friendly identifier',
      options: {
        source: (doc) => `${doc.targetCompany}-${doc.targetRoleTitle}`,
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'targetCompany',
      title: 'Target Company',
      type: 'string',
      group: 'target',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'targetRoleTitle',
      title: 'Target Role Title',
      type: 'string',
      group: 'target',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'jobUrl',
      title: 'Job Posting URL',
      type: 'url',
      group: 'target',
      description: 'Link to original job posting',
    }),

    // === MATCH ANALYSIS (from Agent 2) ===
    defineField({
      name: 'matchCategory',
      title: 'Match Category',
      type: 'string',
      group: 'match',
      options: {
        list: [
          {title: 'Match (70%+)', value: 'match'},
          {title: 'Partial (40-70%)', value: 'partial'},
          {title: 'Reject (<40%)', value: 'reject'},
        ],
      },
      description: 'Agent 2 match assessment',
    }),
    defineField({
      name: 'matchScore',
      title: 'Match Score',
      type: 'number',
      group: 'match',
      description: 'Percentage match (0-100)',
      validation: (Rule) => Rule.min(0).max(100),
    }),
    defineField({
      name: 'gaps',
      title: 'Gaps',
      type: 'array',
      group: 'match',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'requirement', title: 'Requirement', type: 'string'},
            {name: 'gap', title: 'Gap', type: 'string'},
            {name: 'reframe', title: 'Reframe Suggestion', type: 'text'},
          ],
          preview: {
            select: {title: 'requirement', subtitle: 'gap'},
          },
        },
      ],
      description: 'Requirements where evidence is thin (for partial matches)',
    }),
    defineField({
      name: 'profileRef',
      title: 'Profile Used',
      type: 'reference',
      to: [{type: 'profile'}],
      group: 'match',
      description: 'The profile used for matching',
    }),

    // === RESEARCH CONTEXT (for input curation) ===
    defineField({
      name: 'researchContext',
      title: 'Research Context',
      type: 'object',
      group: 'research',
      description: 'Curated inputs that inform the application content',
      fields: [
        defineField({
          name: 'companyPainPoints',
          title: 'Company Pain Points',
          type: 'array',
          of: [{type: 'string'}],
          description: 'What challenges is this company facing that you can address?',
        }),
        defineField({
          name: 'roleKeywords',
          title: 'Role-Specific Keywords',
          type: 'array',
          of: [{type: 'string'}],
          options: {layout: 'tags'},
          description: 'Key terms from the job description to echo',
        }),
        defineField({
          name: 'proofPoints',
          title: 'Your Proof Points',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'claim', type: 'string', title: 'Claim'},
                {name: 'evidence', type: 'text', title: 'Evidence'},
                {name: 'relevance', type: 'string', title: 'Why relevant to this role'},
              ],
            },
          ],
          description: 'Specific examples that prove your fit',
        }),
        defineField({
          name: 'companyResearch',
          title: 'Company Research Notes',
          type: 'text',
          rows: 4,
          description: 'What you learned about the company (culture, products, recent news)',
        }),
        defineField({
          name: 'toneAdjustments',
          title: 'Tone Adjustments',
          type: 'string',
          options: {
            list: [
              {title: 'Formal & Corporate', value: 'formal'},
              {title: 'Warm & Conversational', value: 'warm'},
              {title: 'Bold & Direct', value: 'bold'},
              {title: 'Technical & Precise', value: 'technical'},
            ],
          },
          description: 'How should this application feel?',
        }),
      ],
    }),

    // === CONTENT (output fields) ===
    defineField({
      name: 'customIntroduction',
      title: 'Introduction',
      type: 'text',
      rows: 6,
      group: 'content',
      description: '2-3 paragraphs tailored to the company',
      validation: (Rule) => Rule.required().min(100),
    }),
    defineField({
      name: 'alignmentPoints',
      title: 'Alignment Points',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'heading', type: 'string', title: 'Heading'},
            {name: 'body', type: 'text', title: 'Body'},
          ],
          preview: {
            select: {title: 'heading', subtitle: 'body'},
          },
        },
      ],
      group: 'content',
      description: 'Key points showing why you fit this role',
      validation: (Rule) => Rule.min(2).max(4),
    }),
    defineField({
      name: 'linkedProjects',
      title: 'Linked Projects',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'project'}]}],
      group: 'content',
      description: 'Most relevant projects for this role (max 3)',
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: 'closingStatement',
      title: 'Closing Statement',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Brief closing with call to action',
      validation: (Rule) => Rule.required(),
    }),

    // === METADATA ===
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'string',
      group: 'meta',
      options: {
        list: [
          {title: 'High', value: 'high'},
          {title: 'Medium', value: 'medium'},
          {title: 'Low', value: 'low'},
        ],
      },
      initialValue: 'medium',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'meta',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'In Review', value: 'in-review'},
          {title: 'Ready', value: 'ready'},
          {title: 'Published', value: 'published'},
          {title: 'Archived', value: 'archived'},
        ],
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'yourNotes',
      title: 'Your Notes',
      type: 'text',
      rows: 3,
      group: 'meta',
      description: 'Private notes (not displayed on public page)',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      group: 'meta',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      group: 'meta',
    }),
  ],
  preview: {
    select: {
      company: 'targetCompany',
      role: 'targetRoleTitle',
      status: 'status',
    },
    prepare({company, role, status}) {
      const statusEmoji = {
        draft: '📝',
        'in-review': '👀',
        ready: '✅',
        published: '🌐',
        archived: '📦',
      }
      return {
        title: company || 'Untitled',
        subtitle: `${role || 'No role'} ${statusEmoji[status as keyof typeof statusEmoji] || ''}`,
      }
    },
  },
})
