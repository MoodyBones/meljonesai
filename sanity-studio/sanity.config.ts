import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {desk} from './deskStructure'

export default defineConfig({
  name: 'default',
  title: 'meljonesai',

  projectId: 'psf3aj1o',
  dataset: 'production',

  tools: [structureTool({structure: desk}), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
