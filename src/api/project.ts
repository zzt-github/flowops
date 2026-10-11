import request from '../utils/request'

import type { Project, ProjectForm, ProjectPageResult } from '../types/project'

export const ProjectAPI = {
  async getList() {
    const response = await request.get<Project[]>('/projects')

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
            name: {
              contains: keyword,
            },
          },
          {
            projectNo: {
              contains: keyword,
            },
          },
          {
            managerName: {
              contains: keyword,
            },
          },
        ],
      })
    }

    const response = await request.get<ProjectPageResult>('/projects', {
      params,
    })

    return response.data
  },

  async create(data: ProjectForm) {
    const projects = await this.getList()

    const maxProjectNo =
      projects.length > 0
        ? Math.max(
            ...projects.map((project) =>
              Number(project.projectNo.replace('PRJ', ''))
            )
          )
        : 0

    const projectNo = `PRJ${String(maxProjectNo + 1).padStart(3, '0')}`

    const response = await request.post<Project>('/projects', {
      ...data,
      projectNo,
    })

    return response.data
  },

  async update(id: string, data: ProjectForm) {
    const response = await request.patch<Project>(`/projects/${id}`, data)

    return response.data
  },

  async delete(id: string) {
    await request.delete(`/projects/${id}`)
  },
}
