# Blog Content

这个仓库只负责博客内容，以及内容生产用的脚手架。

## 文章结构

每篇文章使用目录式结构：

```text
posts/
  my-post/
    index.md
    assets/
```

正文里可以直接引用相对资源：

```md
![cover](./assets/cover.jpg)
[附件](./assets/file.pdf)
```

## 新建文章

这个仓库内置了独立脚手架，不依赖 `blog-framework`：

```bash
npm run new:post -- "文章标题"
```

只预览将要生成的内容：

```bash
npm run new:post -- --dry-run "文章标题"
```

脚手架会自动创建：

- `posts/<slug>/index.md`
- `posts/<slug>/assets/.gitkeep`

## 默认配置

默认 frontmatter 配置在 `blog-content.config.json`：

```json
{
  "postsDirectory": "posts",
  "templatePath": "templates/post.md",
  "defaults": {
    "summary": "写一段关于「{{title}}」的摘要。",
    "categories": ["未分类"],
    "tags": [],
    "collections": [],
    "draft": false
  }
}
```

其中：

- `{{title}}` 会替换为文章标题
- `{{slug}}` 会替换为文章 slug
- `{{date}}` 会替换为当天日期

## 当前用途

- `posts/`: 已发布文章
- `scripts/new-post.mjs`: 创建文章骨架
- `templates/post.md`: 文章模板

后续如果需要，可以再扩展出 `drafts/`、`pages/` 等目录，但目前先保持最简。
