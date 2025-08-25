# 古籍Markdown提取器

这个工具专门用于从国学梦网站（guoxuemeng.com）提取古籍内容并转换为Markdown格式。

## 功能特点

- 🎯 **专门针对古籍页面优化**：能够准确识别和提取古籍正文内容
- 📝 **智能内容提取**：自动提取标题、作者信息和正文内容
- 🔗 **保留链接关系**：将原文中的内部链接转换为Markdown链接格式
- 📁 **结构化输出**：生成带有元数据的标准Markdown文件
- 🛡️ **错误处理**：包含完善的错误处理和状态反馈

## 使用方法

```bash
node guoxue-markdown-crawler.js <URL>
```

### 示例

```bash
# 提取太平御览的一个章节
node guoxue-markdown-crawler.js https://www.guoxuemeng.com/guoxue/551521.html

# 提取论语的某个章节
node guoxue-markdown-crawler.js https://www.guoxuemeng.com/guoxue/lunyu/xxx.html
```

## 输出格式

生成的Markdown文件包含以下内容：

1. **标题**：从页面的`<h1>`标签提取
2. **作者信息**：包括作者、全集信息等
3. **元数据**：原文链接和提取时间
4. **正文内容**：
   - 保留原文的段落结构
   - 将内部链接转换为Markdown格式
   - 移除广告和无关内容
   - 保持文本的可读性

## 输出目录

所有生成的Markdown文件保存在 `markdown/` 目录中，文件名格式为：
```
{域名}_{路径}_{时间戳}.md
```

例如：`www_guoxuemeng_com_guoxue_551521_html_2025-08-25T06-13-41-858Z.md`

## 注意事项

- 确保已安装所需依赖：`npm install`
- 该工具专门针对国学梦网站的页面结构设计
- 生成的文件会自动创建 `markdown` 目录
- 建议合理控制抓取频率，避免对网站造成负担

## 依赖模块

- `crawler`: 用于网页抓取
- `fs`: 文件系统操作
- `path`: 路径处理

## 相关文件

- `guoxue-markdown-crawler.js`: 主程序文件
- `save-crawler.js`: 原始的HTML保存爬虫
- `markdown/`: 输出目录（自动创建）