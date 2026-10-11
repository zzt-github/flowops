<template>
  <div class="login-page">
    <el-card class="login-card">
      <h1>FlowOps</h1>
      <p class="subtitle">企业项目协同管理平台</p>

      <el-form>
        <el-form-item>
          <el-input
            v-model="username"
            placeholder="用户名"
          />
        </el-form-item>

        <el-form-item>
          <el-input
            v-model="password"
            type="password"
            placeholder="密码"
            show-password
          />
        </el-form-item>

        <el-button
          type="primary"
          class="login-button"
          @click="handleLogin"
        >
          登录
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../stores/user'

const username = ref('')
const password = ref('')

const router = useRouter()
const userStore = useUserStore()

function handleLogin() {
  const success = userStore.login(username.value, password.value)

  if (success) {
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } else {
    ElMessage.error('用户名或密码错误')
  }
}
</script>

<style scoped>
.login-page {
  width: 100%;
  height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;

  background: #f5f7fa;
}

.login-card {
  width: 400px;
  padding: 20px;
}

.login-card h1 {
  text-align: center;
  margin-bottom: 8px;
}

.subtitle {
  text-align: center;
  color: #999;
  margin-bottom: 30px;
}

.login-button {
  width: 100%;
}
</style>