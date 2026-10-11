<template>
  <div class="employee-page">
    <h2 class="page-title">员工管理</h2>

    <el-card class="search-card">
      <el-form inline>
        <el-form-item label="关键词">
          <el-input
            v-model="keyword"
            placeholder="姓名 / 手机号"
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
        新增员工
      </el-button>
    </div>

    <el-card class="table-card">
      <el-table v-loading="loading" :data="employees">
        <el-table-column
          prop="employeeNo"
          label="员工编号"
          width="120"
        />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="department" label="部门" />
        <el-table-column prop="position" label="职位" />
        <el-table-column prop="phone" label="手机号" />

        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag
              :type="row.status === '在职' ? 'success' : 'info'"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>

            <el-button
              link
              type="danger"
              @click="handleDelete(row)"
            >
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
      :title="editingId === null ? '新增员工' : '编辑员工'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>

        <el-form-item label="部门" prop="department">
          <el-input v-model="form.department" />
        </el-form-item>

        <el-form-item label="职位" prop="position">
          <el-input v-model="form.position" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="在职" value="在职" />
            <el-option label="离职" value="离职" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">
          取消
        </el-button>

        <el-button type="primary" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

import { EmployeeAPI } from '../../api/employee'
import type { Employee, EmployeeForm } from '../../types/employee'



const keyword = ref('')
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

const rules: FormRules<EmployeeForm> = {
  name: [
    {
      required: true,
      message: '请输入员工姓名',
      trigger: 'blur',
    },
  ],

  department: [
    {
      required: true,
      message: '请输入部门',
      trigger: 'blur',
    },
  ],

  position: [
    {
      required: true,
      message: '请输入职位',
      trigger: 'blur',
    },
  ],

  phone: [
    {
      required: true,
      message: '请输入手机号',
      trigger: 'blur',
    },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的11位手机号',
      trigger: 'blur',
    },
  ],
}

const editingId = ref<string | null>(null)

const form = ref<EmployeeForm>({
  name: '',
  department: '',
  position: '',
  phone: '',
  status: '在职',
})

const employees = ref<Employee[]>([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const loading = ref(false)

async function loadEmployees() {
  loading.value = true

  try {
    const result = await EmployeeAPI.getPage(
      pageNum.value,
      pageSize.value,
      keyword.value.trim()
    )

    employees.value = result.data
    total.value = result.items
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadEmployees()
})



function handleSearch() {
  pageNum.value = 1
  loadEmployees()
}

function handleReset() {
  keyword.value = ''
  pageNum.value = 1
  loadEmployees()
}

function handleAdd() {
  editingId.value = null

  form.value = {
    name: '',
    department: '',
    position: '',
    phone: '',
    status: '在职',
  }

  dialogVisible.value = true
}

function handleEdit(row: Employee) {
  editingId.value = row.id

  form.value = {
    name: row.name,
    department: row.department,
    position: row.position,
    phone: row.phone,
    status: row.status,
  }

  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) {
    return
  }

  const valid = await formRef.value
    .validate()
    .catch(() => false)

  if (!valid) {
    return
  }

  if (editingId.value !== null) {
    await EmployeeAPI.update(
      editingId.value,
      form.value
    )

    ElMessage.success('编辑员工成功')
  } else {
    await EmployeeAPI.create(form.value)

    ElMessage.success('新增员工成功')
  }

  dialogVisible.value = false

  await loadEmployees()
}

async function handleDelete(row: Employee) {
  try {
    await ElMessageBox.confirm(
      `确定删除员工“${row.name}”吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await EmployeeAPI.delete(row.id)

    ElMessage.success('删除员工成功')

    await loadEmployees()
  } catch {
    // 用户点击取消，不执行删除
  }
}

function handlePageChange() {
  loadEmployees()
}

function handleSizeChange() {
  pageNum.value = 1
  loadEmployees()
}
</script>

<style scoped>
.employee-page {
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