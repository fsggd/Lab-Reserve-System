import { createRouter, createWebHashHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { setUnauthorizedHandler } from '@/utils/request'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', public: true }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/instruments',
    children: [
      {
        path: 'instruments',
        name: 'InstrumentList',
        component: () => import('@/views/instrument/InstrumentList.vue'),
        meta: { title: '仪器列表', icon: 'Box' }
      },
      {
        path: 'booking/create',
        name: 'BookingCreate',
        component: () => import('@/views/booking/BookingForm.vue'),
        meta: { title: '预约申请', icon: 'EditPen' }
      },
      {
        path: 'my-bookings',
        name: 'MyBookings',
        component: () => import('@/views/booking/MyBookings.vue'),
        meta: { title: '我的预约', icon: 'Tickets' }
      },
      {
        path: 'admin',
        name: 'AdminPanel',
        component: () => import('@/views/admin/AdminPanel.vue'),
        meta: { title: '管理员面板', icon: 'Setting', roles: ['ADMIN', 'SUPER_ADMIN'] }
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/statistics/Statistics.vue'),
        meta: { title: '统计分析', icon: 'DataLine' }
      },
      {
        path: 'dev/interceptor',
        name: 'InterceptorTest',
        component: () => import('@/views/dev/InterceptorTest.vue'),
        meta: { title: 'Axios 拦截器自测', icon: 'Connection', devOnly: true }
      }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/instruments' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 401 时由 request.js 触发跳转（解耦循环依赖）
setUnauthorizedHandler(() => {
  const store = useUserStore()
  store.logout()
  if (router.currentRoute.value.path !== '/login') {
    router.replace({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
  }
})

router.beforeEach((to) => {
  const store = useUserStore()
  document.title = to.meta.title ? `${to.meta.title} - 实验室仪器预约系统` : '实验室仪器预约系统'

  if (to.meta.public) return true

  if (!store.isLogin) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  // 角色权限控制（前端拦截，后端仍需鉴权）
  if (to.meta.roles && !to.meta.roles.includes(store.role)) {
    ElMessage.error('当前角色无权访问该页面')
    return { path: '/instruments' }
  }
  return true
})

export default router
