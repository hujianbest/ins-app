# Lens Archive v1.0.0

[English](./README.md) · **简体中文**

![Lens Archive](https://img.shields.io/badge/version-1.0.0-green)
![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

> **高匹配发现**：让相关的人继续发现你的作品，而不是追求更大的曝光面。

Lens Archive 是一个面向**摄影师 / 模特双主身份**的创作者社区平台，v1.0.0 已完成生产级部署基线。通过相关创作者推荐、作品发现和持久化消息系统，帮助创作者与合适的合作方建立联系。

## 🚀 核心功能

### 创作者平台
- ✅ **真实认证系统** — 邮箱/密码注册登录，替代临时cookie
- ✅ **作品展示** — 发布作品、管理草稿、控制可见性
- ✅ **个人主页** — 定制摄影师/模特资料页（城市、方向、背景语境）
- ✅ **合作发布** — 发布约拍诉求，对接合适的合作方
- ✅ **站内联系** — 一键发起联系，保护隐私的持久化消息系统

### 社交与发现
- ✅ **智能推荐** — 基于规则的相关创作者/相关作品（P95 < 0.05ms）
- ✅ **社交互动** — 关注创作者、评论作品、点赞收藏
- ✅ **统一收件箱** — 直接消息 + 系统通知聚合（30s自动刷新）
- ✅ **发现搜索** — 关键词搜索作品、创作者、合作诉求

### 运营后台
- ✅ **精选位管理** — 运营人员维护首页/发现页精选内容
- ✅ **内容审核** — 隐藏/恢复违规作品，完整审计日志
- ✅ **权限控制** — 基于邮箱的管理员名单（默认拒绝所有访问）

## 🛠️ 技术栈

| 组件 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Next.js 16 + React 19 | App Router + Server Components |
| 类型系统 | TypeScript 5 | 完整类型覆盖 |
| 样式方案 | Tailwind CSS v4 | 暗色杂志风视觉系统 |
| 数据库 | node:sqlite (内置) | 单实例持久化，支持PostgreSQL迁移 |
| 测试框架 | Vitest 4 + Playwright | 单元/组件/E2E覆盖 |
| 容器化 | Multi-stage Dockerfile | Standalone输出 + 健康检查 |

## 📦 快速开始

### 使用Docker（推荐）

```bash
# 克隆仓库
git clone https://github.com/hujianbest/ins-app.git
cd ins-app

# 构建镜像
docker build -t lens-archive:v1.0.0 .

# 启动容器
docker run --rm -p 3000:3000 \
  -e APP_BASE_URL=http://localhost:3000 \
  -e SESSION_COOKIE_SECRET=your-secret-here \
  -e ADMIN_ACCOUNT_EMAILS=admin@example.com \
  -v $PWD/data:/app/.data \
  lens-archive:v1.0.0
```

访问 http://localhost:3000

### 本地开发

```bash
# 要求 Node.js 22+
cd web
npm ci
npm run dev    # 开发服务器 http://localhost:3000
npm run verify # lint + test + build 一站式
```

## 🔧 环境变量

```bash
# 核心配置
APP_BASE_URL=http://localhost:3000
SESSION_COOKIE_SECRET=<生成随机字符串>
SESSION_COOKIE_SECURE=true

# 数据库（默认SQLite）
DATABASE_PROVIDER=sqlite
SQLITE_DATABASE_PATH=/app/.data/community.sqlite

# 可观测性
OBSERVABILITY_LOG_LEVEL=info
OBSERVABILITY_METRICS_ENABLED=true
OBSERVABILITY_METRICS_TOKEN=<生成令牌>
ERROR_REPORTER_PROVIDER=console
SQLITE_BACKUP_DIR=/app/.data/backups

# 运营后台
ADMIN_ACCOUNT_EMAILS=admin1@example.com,admin2@example.com

# 功能开关
HEALTHCHECK_ENABLED=true
RECOMMENDATIONS_RELATED_ENABLED=true
```

## 📊 质量保证

**v1.0.0 发布状态：**
- ✅ 69个任务完成，全部通过质量门禁
- ✅ 338个测试用例通过
- ✅ 所有性能预算达标（30-99%余量）
- ✅ 代码审查/测试审查/追溯性审查全部通过

**性能基准：**
- API健康检查: 3.1ms（预算5ms，38%余量）
- 推荐算法: <0.05ms（预算30ms，99.8%余量）
- 管理后台: <0.03ms（预算80ms，99.96%余量）
- 收件箱加载: 8.1ms（预算120ms，93%余量）

## 🎯 功能清单

| 模块 | 状态 | 说明 |
|------|------|------|
| 🔐 认证系统 | ✅ 完成 | 真实邮箱/密码，安全cookie会话 |
| 👤 个人主页 | ✅ 完成 | 摄影师/模特资料页，可发现性字段 |
| 🖼️ 作品管理 | ✅ 完成 | 发布/草稿/回退，状态机完整 |
| 💬 社交互动 | ✅ 完成 | 关注、评论、点赞、收藏 |
| 📨 消息系统 | ✅ 完成 | 持久化线程，统一收件箱，系统通知 |
| 🎯 智能推荐 | ✅ 完成 | 相关创作者/作品，规则化算法 |
| 🔍 搜索功能 | ✅ 完成 | 跨作品/创作者/诉求关键词搜索 |
| 🛡️ 运营后台 | ✅ 完成 | 精选位管理，内容审核，审计日志 |
| 📊 可观测性 | ✅ 完成 | 结构化日志，指标收集，健康检查 |
| 💾 数据备份 | ✅ 完成 | SQLite备份/恢复CLI工具 |

## 🏗️ 仓库结构

```
.
├── Dockerfile                  # 多阶段生产镜像
├── RELEASE_NOTES.md            # 版本更新日志
├── docs/                       # 技术文档
│   ├── specs/                  # 功能规格
│   ├── designs/                # 技术设计
│   ├── tasks/                  # 任务分解
│   ├── reviews/                # 审查记录
│   └── verification/           # 验证证据
├── web/                        # Next.js 应用
│   ├── src/app/                # 路由和页面
│   ├── src/features/           # 功能模块
│   └── e2e/                    # E2E测试
└── docs/release-v1.0.0/        # v1.0.0 发布包
```

## 🗺️ 发展路线

### v1.1.0（计划中）
- [ ] PostgreSQL 迁移（托管数据库）
- [ ] 对象存储集成（图片上传）
- [ ] 合作履约状态机
- [ ] 消息附件功能

### v1.2.0（计划中）
- [ ] SSE/WebSocket 实时消息
- [ ] 消息分组和群聊
- [ ] 通知偏好设置
- [ ] 邮件摘要

### v2.0.0（长期规划）
- [ ] 支付/订单/会员系统
- [ ] ML 智能推荐
- [ ] 高级搜索（面搜索）
- [ ] 国际化和无障碍
- [ ] 原生 App 支持

## 📋 已知限制

1. **单实例部署** — 当前使用SQLite，仅支持单实例（v1.1将支持PostgreSQL）
2. **本地存储** — 图片资产存储在本地（v1.1将支持对象存储）
3. **轮询刷新** — 消息系统使用30s轮询（v1.2将支持SSE实时推送）

## 🔗 相关链接

- 📦 [v1.0.0 发布包](./docs/release-v1.0.0/release-pack.md)
- 📝 [版本更新日志](./RELEASE_NOTES.md)
- 🗺️ [发展路线图](./docs/ROADMAP.md)
- 🐛 [问题反馈](https://github.com/hujianbest/ins-app/issues)

## 📄 许可证

MIT License — 详见 [LICENSE](./LICENSE)

---

**Lens Archive v1.0.0** — 让合适的合作方发现你的作品

*构建日期：2026-05-10 | 版本：1.0.0*
