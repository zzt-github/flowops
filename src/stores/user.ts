import { defineStore } from 'pinia'
import { ref } from 'vue'

export type UserRole = 'admin' | 'manager' | 'member'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const role = ref<UserRole | ''>(
    (localStorage.getItem('role') as UserRole | null) || ''
  )

  function login(username: string, password: string) {
    const accountMap: Record<string, UserRole> = {
      admin: 'admin',
      manager: 'manager',
      member: 'member',
    }

    if (password !== '123456') {
      return false
    }

    const targetRole = accountMap[username]

    if (!targetRole) {
      return false
    }

    token.value = `flowops-token-${targetRole}`
    role.value = targetRole
    localStorage.setItem('token', token.value)
    localStorage.setItem('role', targetRole)

    return true
  }

  function logout() {
    token.value = ''
    role.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('role')
  }

  return {
    token,
    role,
    login,
    logout,
  }
})