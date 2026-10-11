<template>
  <div class="task-page">
    <h2 class="page-title">任务管理</h2>

    <el-card class="search-card">
      <el-form inline>
        <el-form-item label="关键词">
          <el-input
            v-model="keyword"
            placeholder="任务名称 / 编号"
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
        新增任务
      </el-button>
    </div>

    <el-card class="table-card">
      <el-table v-loading="loading" :data="tasks">
        <el-table-column prop="taskNo" label="任务编号" width="120" />
        <el-table-column prop="title" label="任务名称" />

        <el-table-column label="所属项目" width="170">
          <template #default="{ row }">
            {{ getProjectNameById(row.projectId) || '未知项目' }}
          </template>
        </el-table-column>

        <el-table-column label="负责人" width="140">
          <template #default="{ row }">
            {{ getEmployeeNameById(row.assigneeId) || '未知负责人' }}
          </template>
        </el-table-column>

        <el-table-column label="优先级" width="110">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">
              {{ row.priority }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="开始日期" width="120">
          <template #default="{ row }">
            {{ row.startDate }}
          </template>
        </el-table-column>

        <el-table-column label="截止日期" width="120">
          <template #default="{ row }">
            {{ row.dueDate }}
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
      :title="editingId === null ? '新增任务' : '编辑任务'"
      width="620px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="任务名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入任务名称" />
        </el-form-item>

        <el-form-item label="所属项目" prop="projectId">
          <el-select v-model="form.projectId" placeholder="请选择所属项目" style="width: 100%">
            <el-option
              v-for="project in projectOptions"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="负责人" prop="assigneeId">
          <el-select v-model="form.assigneeId" placeholder="请选择负责人" style="width: 100%">
            <el-option
              v-for="employee in employeeOptions"
              :key="employee.id"
              :label="employee.name"
              :value="employee.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-select v-model="form.priority" style="width: 100%">
            <el-option
              v-for="item in priorityOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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

        <el-form-item label="截止日期" prop="dueDate">
          <el-date-picker
            v-model="form.dueDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择截止日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入任务描述"
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
import { TaskAPI } from '../../api/task'

import type { Employee } from '../../types/employee'
import type { Project } from '../../types/project'
import type { Task, TaskForm, TaskPriority, TaskStatus } from '../../types/task'

const keyword = ref('')
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref<string | null>(null)

const projectOptions = ref<Project[]>([])
const employeeOptions = ref<Employee[]>([])

const projectNameMap = ref<Record<string, string>>({})
const employeeNameMap = ref<Record<string, string>>({})

const statusOptions: Array<{ label: string; value: TaskStatus }> = [
  { label: '待开始', value: '待开始' },
  { label: '进行中', value: '进行中' },
  { label: '已完成', value: '已完成' },
  { label: '已延期', value: '已延期' },
]

const priorityOptions: Array<{ label: string; value: TaskPriority }> = [
  { label: '低', value: '低' },
  { label: '中', value: '中' },
  { label: '高', value: '高' },
]

const form = ref<TaskForm>({
  title: '',
  projectId: '',
  assigneeId: '',
  status: '待开始',
  priority: '中',
  startDate: '',
  dueDate: '',
  description: '',
})

const tasks = ref<Task[]>([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

const rules: FormRules<TaskForm> = {
  title: [
    {
      required: true,
      message: '请输入任务名称',
      trigger: 'blur',
    },
  ],
  projectId: [
    {
      required: true,
      message: '请选择所属项目',
      trigger: 'change',
    },
  ],
  assigneeId: [
    {
      required: true,
      message: '请选择负责人',
      trigger: 'change',
    },
  ],
  status: [
    {
      required: true,
      message: '请选择任务状态',
      trigger: 'change',
    },
  ],
  priority: [
    {
      required: true,
      message: '请选择优先级',
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
  dueDate: [
    {
      required: true,
      message: '请选择截止日期',
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
          callback(new Error('截止日期不能早于开始日期'))
          return
        }

        callback()
      },
      trigger: 'change',
    },
  ],
  description: [
    {
      min: 5,
      message: '任务描述至少 5 个字符',
      trigger: 'blur',
    },
  ],
}

function getProjectNameById(projectId: string) {
  return projectNameMap.value[projectId] || ''
}

function getEmployeeNameById(assigneeId: string) {
  return employeeNameMap.value[assigneeId] || ''
}

function getStatusType(status: TaskStatus) {
  const map: Record<TaskStatus, 'success' | 'info' | 'warning' | 'danger'> = {
    待开始: 'info',
    进行中: 'success',
    已完成: 'success',
    已延期: 'warning',
  }

  return map[status]
}

function getPriorityType(priority: TaskPriority) {
  const map: Record<TaskPriority, 'info' | 'warning' | 'danger'> = {
    低: 'info',
    中: 'warning',
    高: 'danger',
  }

  return map[priority]
}

async function loadProjects() {
  const list = await ProjectAPI.getList()
  projectOptions.value = list
  projectNameMap.value = Object.fromEntries(
    list.map((project) => [project.id, project.name])
  )
}

async function loadEmployees() {
  const list = await EmployeeAPI.getList()
  employeeOptions.value = list
  employeeNameMap.value = Object.fromEntries(
    list.map((employee) => [employee.id, employee.name])
  )
}

async function loadTasks() {
  loading.value = true

  try {
    const result = await TaskAPI.getPage(
      pageNum.value,
      pageSize.value,
      keyword.value.trim()
    )

    tasks.value = result.data
    total.value = result.items
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadProjects()
  await loadEmployees()
  await loadTasks()
})

function handleSearch() {
  pageNum.value = 1
  loadTasks()
}

function handleReset() {
  keyword.value = ''
  pageNum.value = 1
  loadTasks()
}

function handleAdd() {
  editingId.value = null

  form.value = {
    title: '',
    projectId: '',
    assigneeId: '',
    status: '待开始',
    priority: '中',
    startDate: '',
    dueDate: '',
    description: '',
  }

  dialogVisible.value = true
}

function handleEdit(row: Task) {
  editingId.value = row.id

  form.value = {
    title: row.title,
    projectId: row.projectId,
    assigneeId: row.assigneeId,
    status: row.status,
    priority: row.priority,
    startDate: row.startDate,
    dueDate: row.dueDate,
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

  if (editingId.value !== null) {
    await TaskAPI.update(editingId.value, form.value)
    ElMessage.success('编辑任务成功')
  } else {
    await TaskAPI.create(form.value)
    ElMessage.success('新增任务成功')
  }

  dialogVisible.value = false
  await loadTasks()
}

async function handleDelete(row: Task) {
  try {
    await ElMessageBox.confirm(
      `确定删除任务“${row.title}”吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await TaskAPI.delete(row.id)
    ElMessage.success('删除任务成功')
    await loadTasks()
  } catch {
    // 用户取消删除
  }
}

function handlePageChange() {
  loadTasks()
}

function handleSizeChange() {
  pageNum.value = 1
  loadTasks()
}
</script>

<style scoped>
.task-page {
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

:deep(.el-pagination) {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
