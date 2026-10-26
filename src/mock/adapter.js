/**
 * 轻量 Mock 适配器
 *
 * 作用：把 axios 的 adapter 替换成本地假数据，使后端接口未就绪时
 *      前端全部页面 + 拦截器逻辑都能独立跑通与自测。
 * 关闭方式：把 .env.development 里的 VITE_USE_MOCK 改成 false
 *
 * 用法：在 mock 路由表里加一条 { method, path, handler }
 */
import { mockRoutes } from './routes'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function normalizePath(url = '') {
  // 去掉 baseURL 前缀与 query
  return url.replace(/^https?:\/\/[^/]+/, '').replace(/^\/api/, '').split('?')[0]
}

export const mockAdapter = async (config) => {
  const method = (config.method || 'get').toLowerCase()
  const path = normalizePath(config.url)
  const delayMs = Number(import.meta.env.VITE_MOCK_DELAY) || 200

  await delay(delayMs)

  const query = config.params || {}
  let body = config.data
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = {}
    }
  }

  const route = mockRoutes.find(
    (r) =>
      r.method.toLowerCase() === method &&
      matchPath(r.path, path)
  )

  if (!route) {
    return buildResponse(
      config,
      404,
      { code: 404, message: `[Mock] 未匹配的接口 ${method.toUpperCase()} ${path}`, data: null }
    )
  }

  const result = route.handler({ query, body, path, method, headers: config.headers || {} })

  // handler 可直接返回 data（默认成功），也可返回 { status, code, message, data }
  if (result && typeof result === 'object' && ('status' in result || 'code' in result)) {
    const status = result.status || 200
    return buildResponse(config, status, {
      code: result.code ?? (status >= 400 ? status : 200),
      message: result.message || 'OK',
      data: result.data ?? null
    })
  }

  return buildResponse(config, 200, { code: 200, message: 'OK', data: result })
}

function matchPath(pattern, actual) {
  const p = pattern.split('/').filter(Boolean)
  const a = actual.split('/').filter(Boolean)
  if (p.length !== a.length) return false
  return p.every((seg, i) => seg.startsWith(':') || seg === a[i])
}

function buildResponse(config, status, body) {
  return {
    data: body,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config
  }
}
