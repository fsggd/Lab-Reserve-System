import { defineStore } from 'pinia'
import { login as loginApi, getProfile } from '@/api/auth'
import { getToken, setToken, clearToken, getUser, setUser, setStorageMode } from '@/utils/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    userInfo: getUser(),
    loading: false
  }),
  getters: {
    isLogin: (state) => !!state.token,
    role: (state) => state.userInfo?.role || '',
    isAdmin: (state) => ['ADMIN', 'SUPER_ADMIN'].includes(state.userInfo?.role),
    isSuperAdmin: (state) => state.userInfo?.role === 'SUPER_ADMIN',
    displayName: (state) => state.userInfo?.realName || state.userInfo?.username || '未登录'
  },
  actions: {
    async login({ username, password, remember = true }) {
      this.loading = true
      try {
        const res = await loginApi({ username, password })
        setStorageMode(remember)
        this.token = res.token
        this.userInfo = res.user
        setToken(res.token, remember)
        setUser(res.user, remember)
        return res.user
      } finally {
        this.loading = false
      }
    },
    async loadProfile() {
      const profile = await getProfile()
      this.userInfo = profile
      setUser(profile)
      return profile
    },
    logout() {
      clearToken()
      this.token = ''
      this.userInfo = null
    }
  }
})
