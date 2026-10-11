export interface Employee {
  id: string
  employeeNo: string
  name: string
  department: string
  position: string
  phone: string
  status: string
}

export type EmployeeForm = Omit<Employee, 'id' | 'employeeNo'> & {
  employeeNo?: string
}

export interface EmployeePageResult {
  first: number
  prev: number | null
  next: number | null
  last: number
  pages: number
  items: number
  data: Employee[]
}