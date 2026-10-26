# 本地打开 + 上传 GitHub 操作指南（成员B 前端工程）

---

## 一、我做的文件在哪里

有**两个位置**，按你的需要选一个：

| 位置 | 路径 | 大小 | 适合 |
|---|---|---|---|
| **① 完整工程**（含已装好的依赖） | `C:\Users\Error\WorkBuddy\2026-10-25-16-50-24\lab-booking-frontend` | 187 MB | 想**直接就能跑**，不用重新装依赖 |
| **② 干净源码副本**（推荐复制这个） | `C:\Users\Error\WorkBuddy\2026-10-25-16-50-24\lab-booking-frontend-src` | **211 KB** | 上传 GitHub、发给同学、放进统一仓库 |

> 两者的**源码内容完全一样**，区别只有：① 里有 `node_modules/`（依赖，187MB）和 `.git/`（我已建好的本地仓库）；② 里没有。
>
> 复制 ② 之后在新地方执行一次 `npm install` 就能跑，效果和 ① 一模一样。

**怎么打开这个路径**：
复制上面的路径 → 打开「此电脑」→ 点顶部地址栏 → 粘贴 → 回车。
或者按 `Win + R` → 粘贴路径 → 回车，直接弹出文件夹窗口。

---

## 二、搬到你自己本地（复制粘贴，3 步）

假设你想把项目放到 `D:\Projects\lab-booking\`（任何位置都行）：

**第 1 步** 打开 `lab-booking-frontend-src` 文件夹，按 `Ctrl + A` 全选，`Ctrl + C` 复制。

**第 2 步** 在目标位置新建文件夹，例如：
```
D:\Projects\lab-booking\frontend\
```

**第 3 步** 进去，`Ctrl + V` 粘贴。

**改个名字**（可选）：如果你想叫 `frontend` 而不是 `lab-booking-frontend-src`，右键文件夹 → 重命名即可。文件夹名字随便改，不影响运行。

完成后结构应该是这样：
```
D:\Projects\lab-booking\frontend\
├── package.json          ← 看到这个文件就说明复制对了
├── index.html
├── vite.config.js
├── src\
├── docs\
└── ...
```

> ⚠️ **判断复制成功的唯一标准**：目标文件夹里能直接看到 `package.json`。
> 如果你看到的是 `frontend\frontend\package.json`（套了两层），说明粘贴时多包了一层，把里面那层拖出来。

---

## 三、在本地打开并运行

### 方式 A：用 VS Code（推荐，你环境里已经装了）

1. 打开 VS Code
2. `文件` → `打开文件夹` → 选中 `D:\Projects\lab-booking\frontend`
3. 按 `Ctrl + ` ` （反引号，键盘左上角）打开终端
4. 依次执行：

```bash
npm install
npm run dev
```

看到下面这行就成功了：
```
➜  Local:   http://localhost:5173/
```

浏览器访问 `http://localhost:5173/` → 点「**以学生身份登录**」→ 左侧菜单点「**Axios 拦截器自测**」。

### 方式 B：用命令行（CMD / PowerShell）

```bash
cd D:\Projects\lab-booking\frontend
npm install
npm run dev
```

### 装依赖前必读

`npm install` 会去网络下载依赖包。如果很慢，换成国内镜像：

```bash
npm config set registry https://registry.npmmirror.com
npm install
```

装完会多出一个 `node_modules` 文件夹 —— **这个千万不能上传到 GitHub**，`.gitignore` 里已经排除了它，你不用管。

---

## 四、上传到 GitHub

### 第 1 步：GitHub 上建空仓库

1. 打开 https://github.com → 右上角 `+` → `New repository`
2. Repository name 填：`lab-booking-frontend`
3. 选 **Public**（作业展示方便）或 Private
4. **⚠️ 下面这几个都不要勾**：
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
   > 勾了任何一个，GitHub 会生成一个带提交记录的仓库，你本地再 push 就会被拒绝，得多做一步 `git pull --rebase`。空仓库最省事。
5. 点 `Create repository`

创建完会看到一个以 `https://github.com/你的用户名/lab-booking-frontend.git` 结尾的地址，**复制下来**。

### 第 2 步：本地初始化并推送

在 VS Code 终端（或命令行）里，**逐条复制粘贴执行**：

```bash
cd D:\Projects\lab-booking\frontend
```

```bash
git init
```

```bash
git config user.name  "你的GitHub用户名"
git config user.email "你的GitHub绑定邮箱"
```
> 邮箱必须是 GitHub 账号里**已验证**的邮箱，否则提交不会关联到你的头像。
> 查看路径：GitHub → Settings → Emails

```bash
git add .
```

```bash
git commit -m "feat(scaffold): 搭建Vue3+ElementPlus工程，封装Axios统一拦截器，输出页面草图与接口契约

WBS 4.1 交付：
- Vite6 + Vue3.5 + Element Plus 2.9 + Pinia + Vue Router4 + Axios1.7 工程骨架
- utils/request.js：JWT自动携带、统一返回体剥壳、统一错误提示、401跳登录、409冲突提示
- mock/adapter.js：axios adapter 级 Mock，后端未就绪时页面可独立跑通
- router 登录态与角色守卫；layout 侧边菜单按角色过滤
- docs/api-contract.md 接口契约
- docs/wireframes.html 6张页面线框草图"
```

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/你的用户名/lab-booking-frontend.git
```
> 把最后那段换成第 1 步复制的真实地址

```bash
git push -u origin main
```

### 第 3 步：认证（这一步最容易卡住）

执行 `git push` 时会弹窗或命令行要求登录：

- **Username**：填你的 GitHub 用户名
- **Password**：⚠️ **不能填登录密码！** GitHub 早在 2021 年就禁用了密码方式。

填密码会报这个错：
```
remote: Support for password authentication was removed on August 13, 2021.
```

正确做法是生成一个 **Personal Access Token**：

1. GitHub → 右上角头像 → `Settings`
2. 左侧最下面 → `Developer settings`
3. `Personal access tokens` → `Tokens (classic)`
4. `Generate new token` → `Generate new token (classic)`
5. Note 填 `lab-booking`，Expiration 选 `90 days`
6. **勾选 `repo`**（勾选后下面 `repo:*` 会自动全选）
7. 拉到最下面 `Generate token`
8. **立刻复制那串 `ghp_xxx...`**（刷新页面就看不到了，只能重新生成）

然后 push 时：
- Username：你的 GitHub 用户名
- Password：**粘贴这串 `ghp_xxx...`**

Windows 上如果弹出的是图形化登录窗口，选「Sign in with your browser」按提示授权更简单。

---

## 五、备选方案：不用命令行，网页拖拽上传

如果你不想用 git 命令，GitHub 网页也能上传：

1. 进入刚建的仓库页面
2. 点 `uploading an existing file`（或 `Add file` → `Upload files`）
3. 把本地 `frontend` 文件夹**里的内容**（不是文件夹本身）全部拖进去
   - ⚠️ 隐藏文件（`.gitignore`、`.env.development`）在资源管理器里默认不显示，需要先开启「查看 → 显示 → 隐藏的项目」，否则会漏传
4. 拉到最下面 → `Commit changes`

> 缺点：34 个文件要分几次拖（GitHub 单次上限 100 个文件，倒也够），而且**没有分支、没有 PR 记录**。
> 课程要求「分支开发 + PR 评审」，所以**建议还是用命令行**，后面 W8 还要建 `feature/fe-auth` 分支。

---

## 六、验收：怎么证明 WBS 4.1 做完了

### 验收标准对照表

| # | 验收标准 | 怎么验证 | 结果 |
|---|---|---|---|
| 1 | 工程可启动 | `npm run dev` 出 `localhost:5173`；`npm run build` 无报错 | ✅ |
| 2 | Axios 统一拦截器可用 | 登录后 → `/dev/interceptor` → 点 7 个按钮 | ✅ |
| 3 | 绘制页面草图 | 浏览器打开 `docs/wireframes.html` | ✅ |
| 4 | 推送 dev 分支 | GitHub 上能看到分支 + PR | 待你操作 |

### 自测 7 条路径（拦截器验收的核心证据）

登录后打开左侧「**Axios 拦截器自测**」，逐个点击，预期结果：

| 按钮 | 预期看到 |
|---|---|
| ① 成功请求（自动剥壳） | 直接返回 `data` 内容，不需要写 `.data.data` |
| ② 业务异常（code≠200） | 弹红色错误提示，抛出 reject |
| ③ 409 时间冲突 | 弹「该时段已被预约」专用提示 |
| ④ 403 无权限 | 弹权限不足提示 |
| ⑤ 500 服务端错误 | 弹服务器异常提示 |
| ⑥ 401 未授权 | 自动清除 token 并跳回登录页 |
| ⑦ silent 静默模式 | **不弹窗**，只在回调里拿到异常 |

再点「查看请求头」能看到 `Authorization: Bearer xxx` 已自动带上 —— 这就是「携带 JWT」的证据。

### 交给老师 / 成员 C 的证据包（截图 6 张）

建议按这个顺序截图，存到 `docs/screenshots/` 一起提交：

1. `01-工程启动.png` —— 终端里 `npm run dev` 的成功输出
2. `02-构建通过.png` —— `npm run build` 的结果（`built in 5.xx s`）
3. `03-登录页.png`
4. `04-拦截器自测.png` —— 7 个按钮的结果面板
5. `05-草图线框.png` —— `docs/wireframes.html` 打开后的样子
6. `06-GitHub提交记录.png` —— 仓库页面的 commit 列表

---

## 七、几个会让你卡住的坑

| 现象 | 原因 | 解决 |
|---|---|---|
| `npm install` 卡住不动 | 连的是国外源 | `npm config set registry https://registry.npmmirror.com` |
| `npm run dev` 报端口占用 | 5173 被别的程序占了 | 关掉占用程序，或它会自己换到 5174，看终端提示 |
| push 报 `password authentication was removed` | 用了 GitHub 登录密码 | 用 PAT（见第四节第3步） |
| push 报 `failed to push some refs` | 建仓时勾了 README | `git pull --rebase origin main` 后再 push |
| 上传后 GitHub 显示很多文件 | 把 `node_modules` 传上去了 | `git rm -r --cached node_modules` 然后重新 commit |
| 打开页面全是空白 | 依赖没装好 | 删掉 `node_modules` 重新 `npm install` |
| 中文文件名乱码 | Windows 编码 | 本项目全英文路径，不会出现；你自己新建文件也别用中文名 |

---

## 八、下一步（W8）

推上 GitHub 之后，就可以开 `feature/fe-auth` 分支做登录页正式表单了：

```bash
git checkout -b feature/fe-auth
```

做完再 push 并向 `dev` 发 PR，指定成员 C 评审。
