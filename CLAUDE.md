# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个使用 Effect-ts 构建的 CRUD 应用，采用分层架构，包含 PostgreSQL 数据库和 JWT 认证。运行时为 Bun。

## 常用命令

```bash
# 启动开发服务器 (热重载)
bun dev

# 类型检查
bun check

# 运行测试
bun test

# 运行单个测试文件
bun test src/service/UserService.test.ts

# 构建生产版本
bun build

# 启动数据库和 Jaeger (需要 Docker)
bun db:up

# 运行数据库迁移
bun migrate
```

## 架构

### 分层结构

```
src/
├── main.ts           # 应用入口，组合所有 Layer
├── api/              # API 定义层 (HttpApiGroup + Schema)
├── handler/          # 路由处理层 (HttpApiBuilder.group)
├── service/          # 业务逻辑层 (Effect.Service)
├── repository/       # 数据访问层 (SqlClient)
├── schema/           # 数据模型 (Schema.Class)
├── middleware/       # 中间件 (如 auth)
├── config/           # 配置层 (各种 Live Layer)
└── scripts/          # 脚本 (如 migrate.ts)
```

### Layer 依赖图

```
HttpLive
├── CorsLive
├── RateLimiterLive
├── DocsLive (Swagger)
├── ApiLive
│   ├── HealthHandler
│   ├── AuthHandler
│   └── UserHandler
├── ServicesLive
│   ├── AuthService.Default
│   └── UserService.Default
│       └── UserRepository.Default
│           └── DatabaseLive (PgClient)
├── ServerLive (BunHttpServer)
├── TracingLive (OpenTelemetry)
└── LoggerLive
```

### Effect-ts 模式

**Service 定义**：使用 `Effect.Service` 模式定义服务
```typescript
export class UserService extends Effect.Service<UserService>()("UserService", {
  effect: Effect.gen(function* () {
    const repo = yield* UserRepository;
    return { /* methods */ };
  }),
  dependencies: [],
}) {}
```

**错误类型**：使用 `Data.TaggedError` (内部) 或 `Schema.TaggedError` (API)
```typescript
// 内部错误
export class UserNotFoundError extends Data.TaggedError("UserNotFoundError")<{...}> {}
// API 错误 (带 HTTP 状态码)
export class UserNotFoundError extends Schema.TaggedError<UserNotFoundError>()(
  "UserNotFoundError", { message: Schema.String }, HttpApiSchema.annotations({ status: 404 })
) {}
```

**API 定义**：使用 `HttpApiGroup` + `HttpApiEndpoint`
```typescript
export class UserApi extends HttpApiGroup.make("users")
  .add(HttpApiEndpoint.get("getById", "/users/:id").setPath(...).addSuccess(...).addError(...)) {}
```

**Handler 实现**：使用 `HttpApiBuilder.group`
```typescript
export const UserHandler = HttpApiBuilder.group(Api, "users", (handlers) =>
  handlers.handle("getById", ({ path }) => Effect.gen(function* () { ... }))
);
```

### 测试模式

使用 `bun:test` + `Layer.succeed` 模拟依赖：
```typescript
const MockRepo = Layer.succeed(UserRepository, UserRepository.of({
  _tag: "UserRepository",
  findAll: () => Effect.succeed({ items: mockUsers, total: 10 }),
  // ...
}));
const runnable = program.pipe(Effect.provide(UserService.Default), Effect.provide(MockRepo));
await Effect.runPromise(runnable);
```

### 数据库迁移

SQL 迁移文件放在 `src/migrations/` 目录，按文件名排序执行。运行 `bun migrate` 应用迁移。

## 环境变量

参见 `.env.example`。关键配置：
- `DB_*`: 数据库连接
- `JWT_SECRET`: JWT 签名密钥 (生产环境必须修改)
- `LOG_LEVEL`: 日志级别 (trace/debug/info/warning/error/fatal/none)
- `OTEL_EXPORTER_OTLP_ENDPOINT`: OpenTelemetry 端点
