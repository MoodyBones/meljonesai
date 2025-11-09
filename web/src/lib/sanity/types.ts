// Types for Sanity documents used by the web app

export type LinkedProject = {
  _id?: string
  name?: string
  focus?: string
  keyMetric?: string
}

export type JobApplication = {
  _id?: string
  slug?: {current?: string}
  targetCompany?: string
  targetRoleTitle?: string
  customIntroduction?: string
  linkedProject?: LinkedProject
}

export type SlugString = string
