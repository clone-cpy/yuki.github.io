# 林间小筑

基于 [Astro](https://astro.build) + [Fuwari](https://github.com/saicaca/fuwari) 的个人博客。

- 线上地址：<https://clone-cpy.github.io/yuki.github.io/>
- 仓库：<https://github.com/clone-cpy/yuki.github.io>
- 写作：浏览器打开 [Pages CMS](https://app.pagescms.org) 编辑，或本地改 Markdown
- 发布：提交到 `main` 后，GitHub Actions 自动构建并部署

> 仓库名是 `yuki.github.io`，不是 `<用户名>.github.io`，所以 GitHub Pages 把它当作**项目站点**，
> 地址带一层子路径 `/yuki.github.io/`。Astro 的 `base` 已相应配置好。
> 以后如果改用自定义域名或改名成用户站点，记得同步修改 `astro.config.mjs` 里的 `site` / `base`。

## 写文章

### 方式一：Pages CMS（推荐，任何设备）

1. 打开 <https://app.pagescms.org>，用 GitHub 登录并授权 `clone-cpy/yuki.github.io`
2. 左侧「文章」→ 新建，填标题、日期、摘要，上传封面
3. 正文用富文本 / Markdown 写，图片直接上传（会存到 `public/uploads/`）
4. 保存后会自动提交到仓库，约 1 分钟后线上更新

「站点设置」里可以改：站点名称、副标题、主题色、是否显示横幅、横幅图/视频、头像、昵称、简介。
保存后同样会自动构建发布。导航菜单、社交链接等高级项仍在 `src/config.ts`。

### 横幅视频

- 支持 MP4（H.264）和 WebM（VP9），建议 5–10 秒、无声、≤2MB
- Pages CMS 上传走 base64，文件会膨胀约 33%；托管平台请求上限约 4.5MB，所以单文件最好控制在 2MB 以内
- 后台上传后打开「使用横幅视频」开关即可；横幅图片会作为视频封面和兜底
- 同时提供 MP4 + WebM 时优先用 WebM（体积更小），Safari 会自动回退到 MP4
- 访客开启「减少动态效果」时会自动暂停视频

### 方式二：导入现成的 Markdown

Pages CMS 没有直接上传 `.md` 的按钮，但可以把文件导进仓库：

```bash
corepack pnpm post:import ./我的文章.md
corepack pnpm post:import a.md b.md --publish   # 导入并自动提交发布
```

- 没有 frontmatter 会自动补：标题取第一个 `#`，日期取今天，摘要取第一段
- 正文里的相对路径图片会复制到 `public/uploads/`，并改写成 `/uploads/...`
- `--slug=xxx` 指定链接，`--force` 覆盖同名文章
- 也可以手动把 `.md` 放进 `src/content/posts/`（自己写 frontmatter），提交后自动构建
- 通过 GitHub 网页上传也可以：仓库 → `src/content/posts` → Add file → Upload files

### 方式三：本地开发

```bash
corepack pnpm install
corepack pnpm dev        # http://localhost:4321
```

文章在 `src/content/posts/`，新建 `.md` 即可，frontmatter 示例：

```yaml
---
title: 文章标题
published: 2026-11-09
description: 一句话摘要
image: /uploads/cover-1.webp
tags: ["随笔", "写作"]
category: 随笔
draft: false
---
```

图片放在 `public/uploads/`，正文里用 `/uploads/xxx.webp` 引用。

## 本地构建 / 预览

```bash
corepack pnpm build
corepack pnpm preview --port 4400
# http://localhost:4400/yuki.github.io/
```

## 部署

推送到 `main` 即触发 `.github/workflows/deploy.yml`：

1. `pnpm install --frozen-lockfile`
2. `pnpm build`（Astro + Pagefind 搜索索引）
3. `actions/configure-pages` 开启 Pages（首次）
4. 上传 `dist/` 并用 `actions/deploy-pages` 发布

也可以手动触发：仓库 **Actions → Deploy to GitHub Pages → Run workflow**。

## 自定义

| 想改什么 | 改哪里 |
| --- | --- |
| 站点名、副标题、头像、横幅、主题色、昵称、简介 | `src/site.json`（Pages CMS「站点设置」） |
| 导航菜单、社交链接、favicon、目录深度 | `src/config.ts` |
| 关于页 | `src/content/spec/about.md` |
| 文章 | `src/content/posts/*.md` |
| 图片 / 视频 | `public/uploads/`（横幅视频：`banner.mp4` / `banner.webm`） |
| 主题样式细节 | `src/styles/`、`src/components/` |
| Pages CMS 表单字段 | `.pages.yml` |

## 目录

```text
.
├── src/
│   ├── site.json           # 站点信息（Pages CMS 可编辑）
│   ├── config.ts           # 站点配置
│   ├── content/posts/      # 文章
│   ├── content/spec/       # 关于页
│   └── plugins/            # 自定义插件（含 base 路径处理）
├── scripts/import-post.mjs # 导入 Markdown 文章
├── public/uploads/         # 图片
├── .pages.yml              # Pages CMS 配置
├── .github/workflows/      # 自动部署
└── astro.config.mjs        # Astro 配置（site / base）
```

## 说明

- 主题基于 Fuwari（MIT License），已按需修改配置与内容
- 搜索由 Pagefind 在构建时生成，无需服务端
- 评论、统计等动态功能未接入，需要时再选第三方服务
