export type TaskStatus =
  | '待开始'
  | '进行中'
  | '已完成'
  | '已延期'

export type TaskPriority = '低' | '中' | '高'

export interface Task {
  id: string
  taskNo: string
  title: string
  projectId: string
  assigneeId: string
  status: TaskStatus
  priority: TaskPriority
  startDate: string
  dueDate: string
  description: string
}

export type TaskForm = Omit<Task, 'id' | 'taskNo'>

export interface TaskPageResult {
  first: number
  prev: number | null
  next: number | null
  last: number
  pages: number
  items: number
  data: Task[]
}
