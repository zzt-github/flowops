import request from '../utils/request'

import type {
  Employee,
  EmployeeForm,
  EmployeePageResult,
} from '../types/employee'

export const EmployeeAPI = {
  // 查询全部员工
  async getList() {
    const response = await request.get<Employee[]>('/employees')

    return response.data
  },

  // 分页查询员工
  async getPage(
    page: number,
    pageSize: number,
    keyword: string
  ) {
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
            phone: {
              contains: keyword,
            },
          },
        ],
      })
    }

    const response = await request.get<EmployeePageResult>(
      '/employees',
      {
        params,
      }
    )

    return response.data
  },

  // 新增员工
  async create(data: EmployeeForm) {
    const employees = await this.getList()

    const maxEmployeeNo =
      employees.length > 0
        ? Math.max(
            ...employees.map((employee) =>
              Number(employee.employeeNo.replace('EMP', ''))
            )
          )
        : 0

    const employeeNo =
      `EMP${String(maxEmployeeNo + 1).padStart(3, '0')}`

    const response = await request.post<Employee>(
      '/employees',
      {
        ...data,
        employeeNo,
      }
    )

    return response.data
  },

  // 编辑员工
  async update(id: string, data: EmployeeForm) {
    const response = await request.patch<Employee>(
      `/employees/${id}`,
      data
    )

    return response.data
  },

  // 删除员工
  async delete(id: string) {
    await request.delete(`/employees/${id}`)
  },
}