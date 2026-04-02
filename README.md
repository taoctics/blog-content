# Blog Content

这个仓库只存放博客内容。

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

## 当前用途

- `posts/`: 已发布文章

后续如果需要，可以再扩展出 `drafts/`、`pages/` 等目录，但目前先保持最简。
