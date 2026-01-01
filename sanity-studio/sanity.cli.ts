import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'psf3aj1o',
    dataset: 'production'
  },
  deployment: {
    appId: 'il06cy6xng3fdkfs3ya4wyqb',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/cli#auto-updates
     */
    autoUpdates: true,
  }
})
