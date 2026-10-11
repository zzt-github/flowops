<template>
  <div class="project-page">
    <h2 class="page-title">项目管理</h2>

    <el-card class="search-card">
      <el-form inline>
        <el-form-item label="关键词">
          <el-input
            v-model="keyword"
            placeholder="项目名 / 编号 / 负责人"
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            查询
          </el-button>

          <el-button @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">
        新增项目
      </el-button>
    </div>

    <el-card class="table-card">
      <el-table v-loading="loading" :data="projects">
        <el-table-column prop="projectNo" label="项目编号" width="120" />
        <el-table-column prop="name" label="项目名称" />

        <el-table-column label="负责人" width="150">
          <template #default="{ row }">
            {{ getManagerNameById(row.managerId) || row.managerName || '未绑定' }}
          </template>
        </el-table-column>

        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="进度" width="180">
          <template #default="{ row }">
            <el-progress
              :percentage="row.progress"
              :status="getProgressStatus(row.progress, row.status)"
              :stroke-width="10"
            />
          </template>
        </el-table-column>

        <el-table-column label="开始日期" width="120">
          <template #default="{ row }">
            {{ row.startDate }}
          </template>
        </el-table-column>

        <el-table-column label="结束日期" width="120">
          <template #default="{ row }">
            {{ row.endDate }}
          </template>
        </el-table-column>

        <el-table-column label="描述" min-width="220">
          <template #default="{ row }">
            <span class="description-text">{{ row.description || '暂无描述' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="170">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>

            <el-button link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :page-sizes="[5, 10, 20]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId === null ? '新增项目' : '编辑项目'"
      width="620px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>

        <el-form-item label="负责人" prop="managerId">
          <el-select
            v-model="form.managerId"
            placeholder="请选择负责人"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="employee in employeeOptions"
              :key="employee.id"
              :label="employee.name"
              :value="employee.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="项目状态" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="进度" prop="progress">
          <el-input-number
            v-model="form.progress"
            :min="0"
            :max="100"
            :precision="0"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="form.startDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择开始日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="form.endDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择结束日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入项目描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

import { EmployeeAPI } from '../../api/employee'
import { ProjectAPI } from '../../api/project'

import type { Employee } from '../../types/employee'
import type { Project, ProjectForm, ProjectStatus } from '../../types/project'

const keyword = ref('')
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref<string | null>(null)

const employees = ref<Employee[]>([])
const employeeOptions = ref<Employee[]>([])
const employeeNameMap = ref<Record<string, string>>({})

const statusOptions: Array<{ label: string; value: ProjectStatus }> = [
  { label: '规划中', value: '规划中' },
  { label: '进行中', value: '进行中' },
  { label: '暂停', value: '暂停' },
  { label: '已完成', value: '已完成' },
]

const form = ref<ProjectForm>({
  name: '',
  managerId: '',
  managerName: '',
  status: '规划中',
  progress: 0,
  startDate: '',
  endDate: '',
  description: '',
})

const projects = ref<Project[]>([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

const rules: FormRules<ProjectForm> = {
  name: [
    {
      required: true,
      message: '请输入项目名称',
      trigger: 'blur',
    },
  ],
  managerId: [
    {
      required: true,
      message: '请选择项目负责人',
      trigger: 'change',
    },
  ],
  status: [
    {
      required: true,
      message: '请选择项目状态',
      trigger: 'change',
    },
  ],
  startDate: [
    {
      required: true,
      message: '请选择开始日期',
      trigger: 'change',
    },
  ],
  endDate: [
    {
      required: true,
      message: '请选择结束日期',
      trigger: 'change',
    },
    {
      validator: (_, value, callback) => {
        if (!value) {
          callback()
          return
        }

        if (!form.value.startDate) {
          callback(new Error('请先选择开始日期'))
          return
        }

        if (new Date(value) < new Date(form.value.startDate)) {
          callback(new Error('结束日期不能早于开始日期'))
          return
        }

        callback()
      },
      trigger: 'change',
    },
  ],
  progress: [
    {
      required: true,
      message: '请输入项目进度',
      trigger: 'blur',
    },
    {
      validator: (_, value, callback) => {
        if (value === undefined || value === null || value === '') {
          callback(new Error('请输入项目进度'))
          return
        }

        if (Number(value) < 0 || Number(value) > 100) {
          callback(new Error('项目进度必须在 0-100 之间'))
          return
        }

        callback()
      },
      trigger: 'blur',
    },
  ],
  description: [
    {
      required: true,
      message: '请输入项目描述',
      trigger: 'blur',
    },
    {
      min: 5,
      message: '项目描述至少 5 个字符',
      trigger: 'blur',
    },
  ],
}

function getStatusType(status: ProjectStatus) {
  const map: Record<ProjectStatus, 'success' | 'info' | 'warning' | 'danger'> = {
    规划中: 'info',
    进行中: 'success',
    暂停: 'warning',
    已完成: 'success',
  }

  return map[status]
}

function getProgressStatus(progress: number, status: ProjectStatus) {
  if (progress >= 100 || status === '已完成') {
    return 'success'
  }

  if (status === '暂停') {
    return 'exception'
  }

  if (progress >= 60) {
    return 'warning'
  }

  return 'active'
}

function getManagerNameById(managerId: string) {
  return employeeNameMap.value[managerId] || ''
}

async function loadEmployees() {
  employees.value = await EmployeeAPI.getList()
  employeeOptions.value = employees.value
  employeeNameMap.value = Object.fromEntries(
    employees.value.map((employee) => [employee.id, employee.name])
  )
}

async function loadProjects() {
  loading.value = true

  try {
    const result = await ProjectAPI.getPage(
      pageNum.value,
      pageSize.value,
      keyword.value.trim()
    )

    projects.value = result.data
    total.value = result.items
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadEmployees()
  await loadProjects()
})

function handleSearch() {
  pageNum.value = 1
  loadProjects()
}

function handleReset() {
  keyword.value = ''
  pageNum.value = 1
  loadProjects()
}

function handleAdd() {
  editingId.value = null

  form.value = {
    name: '',
    managerId: '',
    managerName: '',
    status: '规划中',
    progress: 0,
    startDate: '',
    endDate: '',
    description: '',
  }

  dialogVisible.value = true
}

function handleEdit(row: Project) {
  editingId.value = row.id

  const managerName = employeeNameMap.value[row.managerId] || row.managerName

  form.value = {
    name: row.name,
    managerId: row.managerId,
    managerName,
    status: row.status,
    progress: row.progress,
    startDate: row.startDate,
    endDate: row.endDate,
    description: row.description,
  }

  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) {
    return
  }

  const valid = await formRef.value.validate().catch(() => false)

  if (!valid) {
    return
  }

  const selectedEmployee = employeeOptions.value.find(
    (employee) => employee.id === form.value.managerId
  )

  form.value.managerName = selectedEmployee?.name || form.value.managerName || ''

  if (editingId.value !== null) {
    await ProjectAPI.update(editingId.value, form.value)
    ElMessage.success('编辑项目成功')
  } else {
    await ProjectAPI.create(form.value)
    ElMessage.success('新增项目成功')
  }

  dialogVisible.value = false
  await loadProjects()
}

async function handleDelete(row: Project) {
  try {
    await ElMessageBox.confirm(
      `确定删除项目“${row.name}”吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await ProjectAPI.delete(row.id)
    ElMessage.success('删除项目成功')
    await loadProjects()
  } catch {
    // 用户取消删除
  }
}

function handlePageChange() {
  loadProjects()
}

function handleSizeChange() {
  pageNum.value = 1
  loadProjects()
}
</script>

<style scoped>
.project-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.search-card,
.table-card {
  overflow: hidden;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
}

.description-text {
  display: inline-block;
  max-width: 240px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.el-pagination) {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
