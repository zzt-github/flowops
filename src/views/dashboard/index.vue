<template>
  <div class="dashboard-page" v-loading="loading">
    <div class="stats-grid">
      <el-card
        v-for="item in statsCards"
        :key="item.title"
        class="stat-card"
      >
        <div class="stat-card__label">{{ item.title }}</div>
        <div class="stat-card__value">{{ item.value }}</div>
      </el-card>
    </div>

    <div class="charts-grid top-row">
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">项目状态分布</div>
        </template>
        <div ref="projectChartRef" class="chart"></div>
      </el-card>

      <el-card class="chart-card">
        <template #header>
          <div class="card-header">任务状态分布</div>
        </template>
        <div ref="taskChartRef" class="chart"></div>
      </el-card>
    </div>

    <div class="charts-grid bottom-row">
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">任务优先级分布</div>
        </template>
        <div ref="priorityChartRef" class="chart"></div>
      </el-card>

      <el-card class="list-card">
        <template #header>
          <div class="card-header">最近任务</div>
        </template>

        <el-table :data="recentTasks" stripe border>
          <el-table-column prop="taskNo" label="编号" width="100" />
          <el-table-column prop="title" label="任务名称" />
          <el-table-column label="所属项目" width="160">
            <template #default="{ row }">
              {{ getProjectNameById(row.projectId) }}
            </template>
          </el-table-column>
          <el-table-column label="负责人" width="120">
            <template #default="{ row }">
              {{ getEmployeeNameById(row.assigneeId) }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="优先级" width="100">
            <template #default="{ row }">
              <el-tag :type="getPriorityType(row.priority)">{{ row.priority }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'

import { EmployeeAPI } from '../../api/employee'
import { ProjectAPI } from '../../api/project'
import { TaskAPI } from '../../api/task'

import type { Employee } from '../../types/employee'
import type { Project } from '../../types/project'
import type { Task, TaskPriority, TaskStatus } from '../../types/task'

const loading = ref(false)
const employees = ref<Employee[]>([])
const projects = ref<Project[]>([])
const tasks = ref<Task[]>([])

const projectChartRef = ref<HTMLElement | null>(null)
const taskChartRef = ref<HTMLElement | null>(null)
const priorityChartRef = ref<HTMLElement | null>(null)

let projectChart: echarts.ECharts | null = null
let taskChart: echarts.ECharts | null = null
let priorityChart: echarts.ECharts | null = null

const projectStatusColors: Record<string, string> = {
  规划中: '#909399',
  进行中: '#409EFF',
  暂停: '#E6A23C',
  已完成: '#67C23A',
}

const taskStatusColors: Record<string, string> = {
  待开始: '#909399',
  进行中: '#409EFF',
  已完成: '#67C23A',
  已延期: '#F56C6C',
}

const priorityColors: Record<string, string> = {
  低: '#67C23A',
  中: '#E6A23C',
  高: '#F56C6C',
}

const statsCards = computed(() => {
  const totalEmployees = employees.value.length
  const totalProjects = projects.value.length
  const activeProjects = projects.value.filter(
    (project) => project.status === '进行中'
  ).length
  const totalTasks = tasks.value.length
  const completedTasks = tasks.value.filter(
    (task) => task.status === '已完成'
  ).length
  const completionRate = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100

  return [
    { title: '员工总数', value: totalEmployees },
    { title: '项目总数', value: totalProjects },
    { title: '进行中项目数', value: activeProjects },
    { title: '任务总数', value: totalTasks },
    { title: '已完成任务数', value: completedTasks },
    { title: '任务完成率', value: `${completionRate.toFixed(0)}%` },
  ]
})

const projectStatusData = computed(() => {
  const map: Record<string, number> = {
    规划中: 0,
    进行中: 0,
    暂停: 0,
    已完成: 0,
  }

  projects.value.forEach((project) => {
    if (project.status in map) {
      map[project.status] += 1
    }
  })

  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
    itemStyle: { color: projectStatusColors[name] },
  }))
})

const taskStatusData = computed(() => {
  const map: Record<string, number> = {
    待开始: 0,
    进行中: 0,
    已完成: 0,
    已延期: 0,
  }

  tasks.value.forEach((task) => {
    if (task.status in map) {
      map[task.status] += 1
    }
  })

  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
    itemStyle: { color: taskStatusColors[name] },
  }))
})

const priorityData = computed(() => {
  const map: Record<string, number> = {
    低: 0,
    中: 0,
    高: 0,
  }

  tasks.value.forEach((task) => {
    if (task.priority in map) {
      map[task.priority] += 1
    }
  })

  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
    itemStyle: { color: priorityColors[name] },
  }))
})

const projectNameMap = computed(() => {
  return Object.fromEntries(
    projects.value.map((project) => [project.id, project.name])
  )
})

const employeeNameMap = computed(() => {
  return Object.fromEntries(
    employees.value.map((employee) => [employee.id, employee.name])
  )
})

const recentTasks = computed(() => {
  return [...tasks.value]
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 5)
})

function getProjectNameById(projectId: string) {
  return projectNameMap.value[projectId] || '未知项目'
}

function getEmployeeNameById(employeeId: string) {
  return employeeNameMap.value[employeeId] || '未知负责人'
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
  const map: Record<TaskPriority, 'success' | 'warning' | 'danger'> = {
    低: 'success',
    中: 'warning',
    高: 'danger',
  }

  return map[priority]
}

function initCharts() {
  if (projectChartRef.value && !projectChart) {
    projectChart = echarts.init(projectChartRef.value)
  }

  if (taskChartRef.value && !taskChart) {
    taskChart = echarts.init(taskChartRef.value)
  }

  if (priorityChartRef.value && !priorityChart) {
    priorityChart = echarts.init(priorityChartRef.value)
  }

  renderCharts()
}

function renderCharts() {
  if (projectChart) {
    projectChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [
        {
          name: '项目状态',
          type: 'pie',
          radius: ['35%', '70%'],
          center: ['50%', '45%'],
          data: projectStatusData.value,
          label: { formatter: '{b}: {c}' },
        },
      ],
    })
  }

  if (taskChart) {
    taskChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'category',
        data: taskStatusData.value.map((item) => item.name),
      },
      yAxis: { type: 'value' },
      series: [
        {
          data: taskStatusData.value.map((item) => item.value),
          type: 'bar',
          itemStyle: {
            color: (params: any) => {
              const name = params.name
              return taskStatusColors[name] || '#409EFF'
            },
          },
        },
      ],
    })
  }

  if (priorityChart) {
    priorityChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [
        {
          name: '任务优先级',
          type: 'pie',
          radius: ['35%', '70%'],
          center: ['50%', '45%'],
          data: priorityData.value,
          label: { formatter: '{b}: {c}' },
        },
      ],
    })
  }
}

function handleResize() {
  projectChart?.resize()
  taskChart?.resize()
  priorityChart?.resize()
}

async function loadDashboardData() {
  loading.value = true

  try {
    const [employeeList, projectList, taskList] = await Promise.all([
      EmployeeAPI.getList(),
      ProjectAPI.getList(),
      TaskAPI.getList(),
    ])

    employees.value = employeeList
    projects.value = projectList
    tasks.value = taskList

    initCharts()
  } catch (error) {
    console.error('Dashboard load failed', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboardData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)

  projectChart?.dispose()
  projectChart = null

  taskChart?.dispose()
  taskChart = null

  priorityChart?.dispose()
  priorityChart = null
})
</script>

<style scoped>
.dashboard-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(140px, 1fr));
  gap: 16px;
}

.stat-card {
  min-height: 120px;
}

.stat-card__label {
  color: #606266;
  font-size: 14px;
  margin-bottom: 10px;
}

.stat-card__value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(300px, 1fr));
  gap: 20px;
}

.chart-card,
.list-card {
  min-height: 330px;
}

.card-header {
  font-weight: 600;
}

.chart {
  width: 100%;
  height: 280px;
}

:deep(.el-card__header) {
  padding: 12px 16px;
}

:deep(.el-card__body) {
  padding: 16px;
}

:deep(.el-table) {
  width: 100%;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>