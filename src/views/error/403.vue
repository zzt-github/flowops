<template>
  <div class="forbidden-page">
    <el-card class="forbidden-card">
      <div class="code">403</div>
      <h2>无权访问该页面</h2>
      <button class="dashboard-btn" type="button" @click="goDashboard">
        返回 Dashboard
      </button>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goDashboard() {
  router.push('/dashboard')
}
</script>

<style scoped>
.forbidden-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.forbidden-card {
  width: 420px;
  text-align: center;
  padding: 20px;
}

.code {
  font-size: 64px;
  font-weight: 700;
  color: #f56c6c;
  margin-bottom: 16px;
}

h2 {
  margin-bottom: 20px;
}

.dashboard-btn {
  border: none;
  border-radius: 6px;
  background: #409eff;
  color: #fff;
  padding: 10px 18px;
  cursor: pointer;
  font-size: 14px;
}
</style>
