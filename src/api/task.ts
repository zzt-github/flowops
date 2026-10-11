import request from '../utils/request'

import type { Task, TaskForm, TaskPageResult } from '../types/task'

export const TaskAPI = {
  async getList() {
    const response = await request.get<Task[]>('/tasks')

    return response.data
  },

  async getPage(page: number, pageSize: number, keyword: string) {
    const params: Record<string, any> = {
      _page: page,
      _per_page: pageSize,
    }

    if (keyword) {
      params._where = JSON.stringify({
        or: [
          {
            title: {
              contains: keyword,
            },
          },
          {
            taskNo: {
              contains: keyword,
            },
          },
        ],
      })
    }

    const response = await request.get<TaskPageResult>('/tasks', {
      params,
    })

    return response.data
  },

  async create(data: TaskForm) {
    const tasks = await this.getList()

    const maxTaskNo =
      tasks.length > 0
        ? Math.max(
            ...tasks.map((task) => Number(task.taskNo.replace('TASK', '')))
          )
        : 0

    const taskNo = `TASK${String(maxTaskNo + 1).padStart(3, '0')}`

    const response = await request.post<Task>('/tasks', {
      ...data,
      taskNo,
    })

    return response.data
  },

  async update(id: string, data: TaskForm) {
    const response = await request.patch<Task>(`/tasks/${id}`, data)

    return response.data
  },

  async delete(id: string) {
    await request.delete(`/tasks/${id}`)
  },
}
