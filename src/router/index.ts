import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    component: () => import('../views/login/index.vue'),
  },
  {
    path: '/403',
    component: () => import('../views/error/403.vue'),
  },
  {
    path: '/',
    component: () => import('../layouts/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: {
          title: '仪表盘',
          roles: ['admin', 'manager', 'member'],
        },
      },
      {
        path: 'employees',
        component: () => import('../views/employee/index.vue'),
        meta: {
          title: '员工管理',
          roles: ['admin'],
        },
      },
      {
        path: 'projects',
        component: () => import('../views/project/index.vue'),
        meta: {
          title: '项目管理',
          roles: ['admin', 'manager'],
        },
      },
      {
        path: 'tasks',
        component: () => import('../views/task/index.vue'),
        meta: {
          title: '任务管理',
          roles: ['admin', 'manager', 'member'],
        },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role') || ''

  if (to.path !== '/login' && !token) {
    return '/login'
  }

  if (to.path === '/login' && token) {
    return '/dashboard'
  }

  const allowedRoles = to.meta?.roles as string[] | undefined

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return '/403'
  }

  return true
})

export default router