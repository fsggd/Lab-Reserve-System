# 实验室仪器预约系统 · 前端

Vue 3 + Element Plus + Axios，实验室仪器线上预约与审批系统的 MVP 前端工程。

| 项 | 内容 |
|---|---|
| 负责人 | 成员 B（前端 & 交互） |
| 技术栈 | Vue 3.5 / Vite 6 / Element Plus 2.9 / Pinia / Vue Router 4 / Axios 1.7 / ECharts 5 |
| 后端约定 | SpringBoot 3 + MyBatis-Plus，统一返回体 `{ code, message, data }`，JWT 鉴权 |
| 当前进度 | **WBS 4.1 已完成**（工程搭建 + Axios 封装 + 页面草图） |

---

## 1. 快速开始

```bash
# 安装依赖（建议用国内源）
npm install --registry=https://registry.npmmirror.com

# 启动开发服务器
npm run dev        # http://localhost:5173

# 生产构建
npm run build
```

> 后端联调时请确保后端运行在 `http://localhost:8080`，Vite 已配置 `/api` 代理转发。

---

## 2. 目录结构

```
lab-booking-frontend
├── src
│   ├── api/              # 接口层，按模块拆分，业务层只调这里
│   │   ├── auth.js       #   登录 / 用户信息
│   │   ├── instrument.js #   仪器台账
│   │   ├── booking.js    #   预约与审批
│   │   └── stats.js      #   统计
│   ├── utils/
│   │   ├── request.js    # ★ Axios 统一封装（JWT + 统一错误提示）
│   │   └── auth.js       # token / 用户信息本地存取
│   ├── mock/             # Mock 适配器（后端未就绪时独立开发用）
│   │   ├── adapter.js    #   替换 axios adapter
│   │   ├── routes.js     #   mock 路由表
│   │   └── data.js       #   mock 数据
│   ├── stores/user.js    # Pinia：登录态与角色
│   ├── router/index.js   # 路由 + 登录/角色守卫
│   ├── layout/index.vue  # 侧边栏 + 顶栏布局（菜单按角色过滤）
│   ├── components/       # 公共组件（PageSkeleton 草图占位）
│   ├── views/            # 页面（WBS 4.1 为草图骨架，W8-W9 填充）
│   └── styles/
├── docs/
│   ├── api-contract.md   # ★ 前后端接口契约（发给成员 A 确认）
│   └── wireframes.html   # ★ 页面草图线框图（可直接浏览器打开/截图）
└── vite.config.js
```

---

## 3. Axios 封装说明（WBS 4.1 验收点）

文件：`src/utils/request.js`

| 能力 | 实现 |
|---|---|
| 自动携带 JWT | 请求拦截器写入 `Authorization: Bearer <token>` |
| 统一返回体剥壳 | 响应拦截器识别 `{code,message,data}`，`code===200` 时直接返回 `data`，业务层无需 `.data.data` |
| 统一错误提示 | 业务错误 / 网络错误 / 超时 / 4xx / 5xx 统一 `ElMessage` 提示，1.5s 内同消息去重 |
| 401 处理 | 清除本地 token → 提示 → 自动跳转登录页（并带上 redirect） |
| 409 冲突 | 预约时间冲突专用文案，提示更明确 |
| 静默模式 | 请求配置 `silent: true` 时不弹提示，由业务层自行处理 |
| Mock 支持 | `VITE_USE_MOCK=true` 时启用本地 adapter，后端未启动也能跑通全部页面 |

```js
// 业务层用法（已剥壳，直接用 data）
import { fetchInstruments } from '@/api/instrument'
const { list, total } = await fetchInstruments({ status: 'NORMAL' })
```

**现场验收方式**：启动项目 → 任意身份登录 → 左侧菜单「Axios 拦截器自测」，
点击 7 个按钮即可看到成功剥壳、业务异常、409 冲突、403、500、401 跳转、silent 静默 共 7 条路径，
以及请求头中自动携带的 `Authorization`。

---

## 4. Mock 模式

`.env.development` 中 `VITE_USE_MOCK=true` 时，所有请求由 `src/mock/adapter.js` 拦截返回假数据，
模拟延迟 200ms。**W10 联调时改为 `false` 即可切换到真实后端，业务代码零改动。**

mock 路由表在 `src/mock/routes.js`，数据与真实接口字段保持一致，页面开发阶段无需等待后端。

---

## 5. Git 协作规范

```
main        稳定版本，只接受来自 dev 的 PR（打 tag v1.0）
└── dev     集成分支，三人 PR 的目标分支
    ├── feature/fe-scaffold      W8 上半：工程骨架 + Axios 封装（本次 WBS 4.1）
    ├── feature/fe-auth          W8 下半：登录页 + 状态管理
    ├── feature/fe-instrument    W9：仪器列表 + 预约表单
    ├── feature/fe-booking       W9：我的预约 + 管理员面板
    └── feature/fe-stats         W9-W10：统计图表 + 联调
```

提交信息格式（Conventional Commits 简化版）：

```
feat(scope): 新增仪器列表页
fix(booking): 修复结束时间早于开始时间未拦截
docs: 补充接口契约
refactor(request): 抽离错误提示去重逻辑
```

---

## 6. WBS 4.1 验收对照

| 验收标准 | 状态 | 证据 |
|---|---|---|
| 搭建 Vue 3 + Element Plus 工程 | ✅ | `npm run dev` 可启动，`npm run build` 构建通过 |
| 封装 Axios（携带 JWT、统一错误提示） | ✅ | `src/utils/request.js` + 「Axios 拦截器自测」页面 7 条路径 |
| 绘制页面草图 | ✅ | `docs/wireframes.html`（6 张线框）+ 各页面骨架与待办清单 |
| 推送 dev 分支 | ⏳ | 见下方命令，仓库地址确认后执行 |

```bash
git checkout -b feature/fe-scaffold
git add .
git commit -m "feat(scaffold): 搭建Vue3+ElementPlus工程，封装Axios统一拦截器"
git push -u origin feature/fe-scaffold
# 随后在 Gitee/GitHub 上向 dev 发起 PR，指定成员 C 评审
```
