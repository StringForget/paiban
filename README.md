<a href="https://github.com/TencentCloudBase/cloudbase-templates"><img src="https://main.qcloudimg.com/raw/9892a3212a49bdd65ba499f2da62ac23.png"></a>

# Vue 排班管理系统

这个目录是基于云开发的一个 [Vue](https://cn.vuejs.org/) 全栈应用示例，包含 Vue + 云函数 + 静态网站部署，可以基于 **[CloudBase Framework](https://github.com/TencentCloudBase/cloudbase-framework)** 框架将项目一键部署到云开发环境

## 线上演示地址

[https://m.yanjj.top/pb/](https://m.yanjj.top/pb/)

点击下方按钮使用 [CloudBase Framework](https://github.com/TencentCloudBase/cloudbase-framework) 可以在云端一键部署本项目到自己的云开发账号上。

[![](https://main.qcloudimg.com/raw/67f5a389f1ac6f3b4d04c7256438e44f.svg)](https://console.cloud.tencent.com/tcb/env/index?action=CreateAndDeployCloudBaseProject&tdl_anchor=github&tdl_site=0&appUrl=https%3A%2F%2Fgithub.com%2FTencentCloudBase%2Fcloudbase-templates&workDir=vue&appName=vue)

## 部署方法

### 步骤一. 准备工作

具体步骤请参照 [准备云开发环境和 CloudBase CLI 命令工具](https://github.com/TencentCloudBase/cloudbase-framework/blob/master/CLI_GUIDE.md)

### 步骤二. 初始化应用示例

在命令行执行

```bash
tcb new vue-app vue
```

### 步骤三. 一键部署

进入到项目目录，在命令行执行

```bash
tcb framework deploy
```

## 开发命令及配置

### 本地开发

```
npm run dev
```

### 上线部署

```
npm run deploy
```

### Lint

```
npm run lint
```

### CloudBase Framework 相关开发配置

查看 [CloudBase Framework 配置](https://github.com/TencentCloudBase/cloudbase-framework).

### Vue 相关开发配置

查看 [Configuration Reference](https://cli.vuejs.org/config/).
