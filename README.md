<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>


  <p align="center">基于 <a href="https://github.com/nestjs/nest">Nest</a> 开发的NodeJs API 基础框架</p>
 

## 安装 & 开发

### 使用 nest-cli 脚手架

文档地址：[https://docs.nestjs.com/cli/overview](https://docs.nestjs.com/cli/overview)

```bash
pnpm install -g @nestjs/cli
```

### 安装依赖

```bash
$ pnpm install
```

### 本地开发

```bash
# development
$ pnpm run dev
```

## 环境配置

目前在根目录下 有 `.env.test` 和 `.env.prod` 两个文件，自行扩展

## 部署

使用`pm2` 进行管理, 配置信息在根目录 `ecosystem.config.js` 

```bash
# test
pnpm run deploy:test
# prod
pnpm run deploy:prod
```

## 核心模块

### 使用 Fastify 替换 Express
[https://fastify.dev/](https://fastify.dev/)

### 使用jwt进行双token验证
[https://github.com/nestjs/jwt](https://github.com/nestjs/jwt)

### 使用nest-winston进行日志管理
[https://github.com/gremo/nest-winston](https://github.com/gremo/nest-winston)

[https://github.com/winstonjs/winston](https://github.com/winstonjs/winston)

### 使用 typeORM 进行数据库连接

[https://github.com/nestjs/typeorm](https://github.com/nestjs/typeorm)


### 使用 swagger 进行接口文档管理

访问url为 `http://{host:port}/docs`

[https://github.com/nestjs/swagger](https://github.com/nestjs/swagger)