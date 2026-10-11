# FlowOps

这是一个面向前端工程实践和实习面试展示的企业项目协同管理平台。

## 在线 Demo

- 前端：https://flowops-production-0f74.up.railway.app
- Mock API：https://flowops-api-production.up.railway.app

## 测试账号

- admin / 123456
- manager / 123456
- member / 123456

## 核心功能

- 登录认证
- Router Guard
- 轻量 RBAC
- 员工管理
- 项目管理
- 任务管理
- Dashboard 数据看板
- 服务端分页
- 查询
- 表单校验
- Axios 统一封装

## 核心业务关系

Employee
↓
Project
↓
Task

说明：

- Project.managerId → Employee.id
- Task.projectId → Project.id
- Task.assigneeId → Employee.id

## 权限说明

admin：
Dashboard / Employee / Project / Task

manager：
Dashboard / Project / Task

member：
Dashboard / Task

## 技术栈

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Element Plus
- Axios
- ECharts
- json-server
- Railway

## 项目结构

src/
├─ api
├─ layouts
├─ router
├─ stores
├─ types
├─ utils
└─ views

## 部署说明

- 前端和 Mock API 均部署在 Railway。
- 在线 Demo 使用 json-server 模拟 REST API。
- 数据可能因云服务重启或重新部署恢复为初始 db.json 数据。

## 启动方式

本地开发：

```bash
npm install
npm run dev
```

Mock API：

```bash
npx json-server db.json --port 3001
```

## 项目定位

这是一个面向前端工程实践和实习面试展示的企业项目协同管理平台，聚焦于常见后台管理系统中的登录认证、权限控制、数据列表、查询筛选、表单管理和看板展示等功能实现。

不涉及夸张表述，也不宣称为生产级、商业级或高并发真实企业系统。
