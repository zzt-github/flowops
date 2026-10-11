# FlowOps

基于 Vue 3 + TypeScript 的企业项目协同管理平台。

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

## 核心功能

- 登录认证
- 路由守卫
- 轻量 RBAC
- 员工管理
- 项目管理
- 任务管理
- Dashboard 数据看板
- 表单校验
- 服务端分页和查询

## 核心业务关系

Employee
↓
Project
↓
Task

说明：
Project 通过 managerId 关联 Employee。
Task 通过 projectId 关联 Project。
Task 通过 assigneeId 关联 Employee。

## 权限角色

admin：
全部模块

manager：
Dashboard / Project / Task

member：
Dashboard / Task

## 测试账号

admin / 123456
manager / 123456
member / 123456

## 项目启动

npm install

前端：
npm run dev

Mock 后端：
npx json-server db.json --port 3001

## 项目结构

src 下主要目录：

- api：HTTP 请求与数据访问层
- layouts：应用布局和通用容器
- router：路由注册与权限守卫
- stores：Pinia 状态管理
- types：类型定义
- utils：公共工具函数
- views：页面模块

## 项目说明

当前 json-server 用于模拟 RESTful 后端。
生产项目中认证、权限、编号生成、数据校验等通常应由真实后端处理。
