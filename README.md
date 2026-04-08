# 节点销售网络 — 管理后台

节点销售网络管理后台，独立部署的 Next.js 应用，连接主项目 ([nw_nf](https://github.com/willNotRandom/nw_nf)) 同一数据库，提供平台运营和链上管理功能。

## 功能模块

| 模块 | 路径 | 功能 |
|------|------|------|
| **概览仪表盘** | `/` | 平台指标（NFT 数量、交易量、佣金、用户数）、V3 成本结算统计、L1 批发交易统计 |
| **黑名单管理** | `/blacklist` | 查看/添加/移除黑名单地址、L1 黑名单传播（propagateBlacklist 到所有 L2）、异常转账标记审核 |
| **L2 管理** | `/l2-management` | 已注册 L2 实例列表、L2 状态监控、注册/注销 L2 |
| **资金管理** | `/funds` | Aave 收益仓位查看、合约持有资金、资金提取操作 |
| **事件日志** | `/logs` | 链上事件实时查看（Transfer、Purchase、CostSettled 等） |
| **操作审计** | `/audit` | 全库数据聚合展示（330+ 条目）、管理操作记录 |
| **数据分析** | `/analytics` | 交易趋势、用户增长、佣金分析图表 |

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 15.3 | 全栈框架（App Router） |
| React | 19 | UI |
| Prisma | 6.6 | 数据库 ORM（只读连接主项目 PostgreSQL） |
| viem | 2.47 | 链上合约交互（黑名单传播、资金操作） |
| Recharts | 2.15 | 数据可视化图表 |
| TailwindCSS | 4 | 样式 |
| zustand | 5 | 状态管理 |

## 项目结构

```
src/
├── app/
│   ├── page.tsx                  # 概览仪表盘
│   ├── blacklist/page.tsx        # 黑名单管理
│   ├── l2-management/page.tsx    # L2 管理
│   ├── funds/page.tsx            # 资金管理
│   ├── logs/page.tsx             # 事件日志
│   ├── audit/page.tsx            # 操作审计
│   ├── analytics/page.tsx        # 数据分析
│   └── api/                      # API 路由
│       ├── metrics/              # 仪表盘指标
│       ├── blacklist/            # 黑名单 CRUD + 链上执行
│       ├── l2/                   # L2 实例管理
│       ├── funds/                # 资金查询
│       ├── logs/                 # 事件日志查询
│       ├── audit/                # 审计数据聚合
│       └── analytics/            # 分析数据
├── components/layout/
│   ├── Sidebar.tsx               # 导航侧边栏
│   └── Providers.tsx             # React Query Provider
└── lib/
    ├── abi.ts                    # V3/L1 合约 ABI
    ├── chain.ts                  # 多链配置
    ├── prisma.ts                 # Prisma 客户端
    └── utils.ts                  # 工具函数
```

## 快速开始

### 前置条件

- Node.js 20+
- 主项目 PostgreSQL 数据库已运行（`docker compose up -d`）

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

```bash
cp .env.local.example .env.local
# 编辑 .env.local：
# - DATABASE_URL=<主项目同一数据库连接串>
# - NEXT_PUBLIC_CHAIN_RPC=<链 RPC>
# - NEXT_PUBLIC_CONTRACT_ADDRESS=<合约地址>
# - NEXT_PUBLIC_ADMIN_WALLETS=<管理员钱包地址>
# - ADMIN_PRIVATE_KEY=<管理员私钥，用于链上操作>
```

### 3. 生成 Prisma 客户端

```bash
npx prisma generate
```

### 4. 启动

```bash
npm run dev  # 端口 3003
```

访问 http://localhost:3003

## 与主项目的关系

- **数据库共享**：连接 `nw_nf` 主项目的 PostgreSQL，Prisma schema 与主项目同步
- **链上交互**：通过 viem 直接调用 V3/L1 合约（黑名单传播、资金管理）
- **独立部署**：单独的 Next.js 应用，端口 3003，不影响主项目前端（端口 3000）

## 许可证

私有项目 — 保留所有权利。
