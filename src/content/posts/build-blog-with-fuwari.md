---
title: 用 Astro + Fuwari 重做博客
published: 2026-11-07
description: 从 Node 后台换到静态站，记录一次不太折腾的迁移。
image: /uploads/mw8zu7fc-m9gcgtzt.png
tags:
  - Astro
  - 建站
  - 前端
category: 技术
draft: false
---
之前那个博客是自己用 Node 写的一套后台：本地跑服务，写 Markdown，上传图片，再导出一份静态站推到 GitHub Pages。能用，但每次写作都要先 `node server.js`，换台设备就没法写。

这次换成了 **Astro + Fuwari**：内容是仓库里的 Markdown，编辑交给 Pages CMS，构建和部署交给 GitHub Actions。

## 为什么是 Astro

- 默认输出纯静态 HTML，没有运行时负担
- 内容用 Markdown / MDX，迁移成本低
- 生态里现成的好主题多，比如 Fuwari

Fuwari 的视觉是那种「毛玻璃 + 大封面」的卡片流，自带深色模式、搜索、目录、代码高亮，几乎不用改就能用。

## 整个发布流程

![发布流程：写文章 → 传图片 → 推送 → 自动上线](/uploads/workflow.webp)

对应的仓库结构大概是这样：

```text
yuki.github.io/
├── src/
│   ├── config.ts            # 站点名、头像、横幅、导航
│   ├── content/posts/       # 文章（Markdown）
│   └── content/spec/        # 关于页
├── public/uploads/          # 图片
├── .pages.yml               # Pages CMS 编辑配置
└── .github/workflows/       # 自动构建部署
```

## 部署配置

因为仓库是 `yuki.github.io`，GitHub Pages 会给它一个子路径 `/<repo>/`，所以 Astro 里要同时设置 `site` 和 `base`：

```js
export default defineConfig({
  site: "https://clone-cpy.github.io",
  base: "/yuki.github.io",
});
```

再写一个 workflow，把 `dist/` 交给 Pages 就行。以后每次提交，Actions 都会自动构建。

## 一点取舍

静态站没有服务端，所以评论、访问统计这些要么接第三方，要么不要。我倾向于先不要：先把内容写起来，再考虑这些。


| 需求 | 方案 |
| --- | -------------------- |
| 写作 | Pages CMS（浏览器里编辑） |
| 图片 | 上传到 `public/uploads` |
| 发布 | GitHub Actions 自动构建 |
| 搜索 | Pagefind（构建时生成索引） |


