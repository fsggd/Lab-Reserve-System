import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi, getProfile } from '@/api/auth'
import { getToken, setToken, clearToken, getUser, setUser, setStorageMode } from '@/utils/auth'
import { getHomePathByRole, isAdminRole } from '@/utils/role'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    userInfo: getUser(),
    remember: true,
    loading: false
  }),
  getters: {
    isLogin: (state) => !!state.token,
    role: (state) => state.userInfo?.role || '',
    // 决策①：管理员与超级管理员同等放行
    isAdmin: (state) => isAdminRole(state.userInfo?.role),
    isSuperAdmin: (state) => state.userInfo?.role === 'SUPER_ADMIN',
    displayName: (state) => state.userInfo?.realName || state.userInfo?.username || '未登录',
    // 登录成功后按角色跳转的默认工作台
    homePath() {
      return getHomePathByRole(this.role)
    }
  },
  actions: {
    /** 账号密码登录：成功后写入 token 与用户信息 */
    async login({ username, password, remember = true }) {
      this.loading = true
      try {
        const res = await loginApi({ username, password })
        // remember=false 时使用 sessionStorage，关闭浏览器即失效
        this.remember = remember
        setStorageMode(remember)
        this.token = res.token
        setToken(res.token, remember)
        if (res.user) {
          this.userInfo = res.user
          setUser(res.user, remember)
        } else {
          // 后端若只返回 token，则回查 /auth/profile 补全用户信息
          await this.loadProfile()
        }
        return this.userInfo
      } finally {
        this.loading = false
      }
    },
    async loadProfile() {
      const profile = await getProfile()
      this.userInfo = profile
      setUser(profile, this.remember)
      return profile
    },
    /**
     * 退出登录
     * @param {boolean} notifyServer 是否通知后端失效 token（手动退出时传 true）
     */
    logout(notifyServer = false) {
      if (notifyServer) {
        logoutApi().catch(() => {}) // 后端若无失效逻辑也不影响前端清理
      }
      clearToken()
      this.token = ''
      this.userInfo = null
    }
  }
})
