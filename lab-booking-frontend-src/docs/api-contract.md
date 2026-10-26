# 前后端接口契约 v0.1（草稿 · 待成员 A 确认）

> 负责人：成员 B（前端）　请成员 A 在 **10/26 前**确认或直接在文档中修改后提交 PR。
> 契约一旦冻结，任何字段变更需在群里同步 + 提 PR 修改本文件，避免口头约定导致返工。

## 0. 通用约定

| 项 | 约定 |
|---|---|
| 基础路径 | `/api`（前端 dev 环境已配 Vite 代理到 `http://localhost:8080`） |
| 认证方式 | `Authorization: Bearer <jwt>`，除 `/auth/login` 外所有接口必带 |
| 请求格式 | `Content-Type: application/json` |
| 统一返回体 | `{ "code": 200, "message": "OK", "data": <任意> }` |
| 分页约定 | `data = { list: [], total: 100 }`，入参 `pageNum` 从 1 开始、`pageSize` 默认 10 |
| 时间格式 | 统一字符串 `yyyy-MM-dd HH:mm:ss`（前端不做时区转换） |

### code 定义（前端已按此处理）

| code | 含义 | 前端行为 |
|---|---|---|
| 200 | 成功 | 剥壳取 `data` |
| 400 | 参数错误 | 提示 `message` |
| 401 | 未认证 / token 失效 | 清 token → 提示 → 跳登录页 |
| 403 | 无权限 | 提示"无权限" |
| **409** | **预约时间冲突** | 提示"时间冲突：xxx"（本项目核心校验） |
| 500 | 服务器异常 | 提示"服务器开小差了" |

> 请 A 确认：401 除了返回 `code:401`，HTTP 状态码是否也返回 401？前端两种都已兼容。

---

## 1. 认证模块

| # | 方法 | 路径 | 请求体 / 参数 | 返回 data | 备注 |
|---|---|---|---|---|---|
| 1 | POST | `/auth/login` | `{ username, password }` | `{ token, user: { id, username, realName, role, phone } }` | 失败返回 400 + 中文 message；`role`: STUDENT / ADMIN / SUPER_ADMIN |
| 2 | GET | `/auth/profile` | - | `user` 对象 | 前端刷新页面时用于恢复登录态 |
| 3 | POST | `/auth/logout` | - | - | 后端若无状态失效逻辑，可返回固定成功 |

## 2. 仪器模块

| # | 方法 | 路径 | 请求体 / 参数 | 返回 data | 备注 |
|---|---|---|---|---|---|
| 4 | GET | `/instruments` | `name?`, `status?`, `pageNum`, `pageSize` | `{ list: [instrument], total }` | name 模糊匹配 |
| 5 | GET | `/instruments/{id}` | - | `instrument` | 详情页 / 预约页回填 |
| 6 | POST | `/instruments` | instrument 对象（不含 id） | `{ id }` | 仅管理员 |
| 7 | PUT | `/instruments/{id}` | instrument 对象 | `{ id }` | 仅管理员 |
| 8 | DELETE | `/instruments/{id}` | - | `true` | 仅管理员；若存在有效预约建议返回 409 |

**instrument 对象字段**

```jsonc
{
  "id": 1,
  "name": "扫描电子显微镜",
  "model": "SEM-2000",
  "location": "实验楼A-301",
  "status": "NORMAL",          // NORMAL 正常 | REPAIRING 维修 | DISABLED 停用
  "availableStart": "09:00",   // 每日可预约起始（HH:mm）
  "availableEnd": "18:00",
  "availableSlots": [],        // ⚠️ 待确认问题 2
  "remark": "需提前培训"
}
```

## 3. 预约模块

| # | 方法 | 路径 | 请求体 / 参数 | 返回 data | 备注 |
|---|---|---|---|---|---|
| 9 | GET | `/bookings` | `status?`, `instrumentId?`, `userName?`, `pageNum`, `pageSize` | `{ list: [booking], total }` | 管理员看全部 |
| 10 | GET | `/bookings/mine` | 同上 | `{ list, total }` 或 `list` | 学生看自己的 |
| 11 | POST | `/bookings` | `{ instrumentId, startTime, endTime, purpose }` | `{ id }` | **时间重叠时返回 409** |
| 12 | POST | `/bookings/{id}/approve` | - | `true` | 仅管理员 |
| 13 | POST | `/bookings/{id}/reject` | `{ reason }` | `true` | **reason 必填**，仅管理员 |
| 14 | DELETE | `/bookings/{id}` | - | `true` | 学生取消自己的有效预约 |

**booking 对象字段**

```jsonc
{
  "id": 101,
  "instrumentId": 1,
  "instrumentName": "扫描电子显微镜",
  "userName": "张三",
  "startTime": "2026-10-26 09:00:00",
  "endTime": "2026-10-26 11:00:00",
  "purpose": "材料表面形貌观察",
  "status": "PENDING",   // PENDING 待审批 | APPROVED 已通过 | REJECTED 已驳回
                         // COMPLETED 已完成 | CANCELLED 已取消
  "rejectReason": ""     // 仅 REJECTED 时有值
}
```

## 4. 统计模块

| # | 方法 | 路径 | 参数 | 返回 data |
|---|---|---|---|---|
| 15 | GET | `/stats/overview` | `days?`（默认 7） | 见下 |

```jsonc
{
  "summary": { "totalBookings": 80, "pendingCount": 12, "instrumentCount": 8, "availableCount": 6 },
  "bookingTrend":  [{ "date": "10-19", "count": 5 }],
  "utilization":   [{ "name": "扫描电子显微镜", "rate": 82 }],
  "statusRatio":   [{ "name": "待审批", "value": 12 }]
}
```

---

## ⚠️ 今晚必须确认的 3 个问题

| # | 问题 | 影响 | 前端暂定方案 |
|---|---|---|---|
| 1 | **超级管理员**是否需要「用户管理页」（增删改用户 / 改角色）？ | 决定多一个页面，约 0.5 天工作量 | 暂不做，超管权限等同管理员 |
| 2 | **仪器可用时段**返回什么结构？是 `availableSlots: [{start, end}]` 数组，还是只给 `availableStart/availableEnd`？ | 决定预约表单能否把"已被占用的时段"置灰 | 暂按只有开放时间做，冲突靠提交后 409 提示 |
| 3 | **仪器利用率**口径：已预约时长 ÷ 可用总时长，还是预约次数 ÷ 仪器数？ | 图表口径变了要重画 | 暂按「已预约时长 ÷ 可用总时长（百分比）」 |

---

## 变更记录

| 日期 | 版本 | 修改人 | 说明 |
|---|---|---|---|
| 2026-10-25 | v0.1 | 成员 B | 初稿，依据需求文档与前端页面需要整理 |
