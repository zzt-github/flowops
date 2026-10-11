export type ProjectStatus =
  | '规划中'
  | '进行中'
  | '暂停'
  | '已完成'

export interface Project {
  id: string
  projectNo: string
  name: string
  managerId: string
  managerName: string
  status: ProjectStatus
  progress: number
  startDate: string
  endDate: string
  description: string
}

export type ProjectForm = Omit<Project, 'id' | 'projectNo'>

export interface ProjectPageResult {
  first: number
  prev: number | null
  next: number | null
  last: number
  pages: number
  items: number
  data: Project[]
}
