<template>
  <div class="layout">
    <aside class="sidebar">
      <h2>FlowOps</h2>

      <nav>
        <RouterLink
          v-for="item in visibleMenus"
          :key="item.path"
          :to="item.path"
        >
          {{ item.title }}
        </RouterLink>
      </nav>
    </aside>

    <div class="main">
      <header class="navbar">
        <div>FlowOps 企业项目协同管理平台</div>

        <div class="user-area">
          <span>{{ roleLabel }}</span>

          <el-button
            type="danger"
            size="small"
            @click="handleLogout"
          >
            退出登录
          </el-button>
        </div>
      </header>

      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const roleLabelMap: Record<string, string> = {
  admin: '管理员',
  manager: '项目经理',
  member: '成员',
}

const visibleMenus = computed(() => {
  const routeChildren = router.options.routes.find((route) => route.path === '/')?.children ?? []

  return routeChildren
    .filter((route) => {
      const roles = Array.isArray(route.meta?.roles) ? route.meta.roles : []
      return roles.length === 0 || roles.includes(userStore.role)
    })
    .map((route) => ({
      path: `/${route.path}`,
      title: route.meta?.title || route.path,
    }))
})

const roleLabel = computed(() => roleLabelMap[userStore.role] || '未登录')

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: #f5f7fb;
}

.sidebar {
  width: 220px;
  padding: 20px 12px;
  background: #001529;
  color: #fff;
}

.sidebar h2 {
  margin: 0 0 20px;
  padding: 0 8px;
  font-size: 28px;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar a {
  display: block;
  padding: 10px 12px;
  border-radius: 8px;
  color: #dfe7f5;
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.sidebar a:hover,
.sidebar a.router-link-active {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.main {
  flex: 1;
  min-width: 0;
}

.navbar {
  height: 64px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #eaeef2;
  box-sizing: border-box;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.content {
  padding: 20px;
}
</style>