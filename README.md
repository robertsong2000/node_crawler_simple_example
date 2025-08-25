# Node Crawler 简单示例

这个项目展示了如何使用 node-crawler 库来实现各种网页爬取功能。

## 安装依赖

```bash
npm install
```

## 示例文件

### 1. simple-crawler.js
最简单的爬取示例，演示如何爬取单个网页并提取基本信息。

运行：
```bash
node simple-crawler.js
```

功能：
- 爬取 http://example.com
- 提取页面标题和 H1 标签
- 获取页面链接

### 2. multiple-urls-crawler.js
演示如何批量爬取多个 URL。

运行：
```bash
node multiple-urls-crawler.js
```

功能：
- 同时爬取多个网站
- 限制并发连接数
- 提取每个页面的统计信息

### 3. dynamic-content-crawler.js
使用 JSDOM 处理更复杂的 DOM 结构。

运行：
```bash
node dynamic-content-crawler.js
```

功能：
- 使用 JSDOM 替代 jQuery
- 提取更复杂的页面元素
- 处理脚本和表单

### 4. robust-crawler.js
带有完整错误处理和重试机制的爬虫。

运行：
```bash
node robust-crawler.js
```

功能：
- 自动重试失败的请求
- 请求超时处理
- 速率限制避免被封禁
- 详细的错误日志

### 5. crawl-cli.js
简单的命令行爬取工具，可以通过命令行参数指定URL。

运行：
```bash
node crawl-cli.js <URL>
# 示例
node crawl-cli.js https://example.com
```

功能：
- 通过命令行参数指定URL
- 提取页面的基本信息统计
- 显示标题、链接、图片等信息
- 适合快速查看网页内容

### 6. interactive-crawler.js
交互式爬取工具，用户可以选择要提取的信息类型。

运行：
```bash
node interactive-crawler.js
```

功能：
- 交互式输入URL
- 可选择爬取内容类型：
  - 页面标题
  - 所有标题
  - 所有链接
  - 所有图片
  - 段落文本
  - 元数据信息
  - 全部信息
- 更友好的用户界面

### 7. save-crawler.js
将爬取的网页保存到本地文件的爬虫工具。

运行：
```bash
node save-crawler.js <URL>
# 示例
node save-crawler.js https://example.com
```

功能：
- 将完整的HTML内容保存到 generated/ 目录
- 自动创建文件名（域名_路径_时间戳.html）
- 同时提取和显示页面基本信息
- 保存的文件会被 .gitignore 忽略，不会提交到版本控制

### 8. html-to-markdown.js
将爬取的网页转换为 Markdown 格式。

运行：
```bash
node html-to-markdown.js <URL>
# 示例
node html-to-markdown.js https://example.com
```

功能：
- 使用 TurndownService 将 HTML 转换为 Markdown
- 自动提取页面标题和元数据
- 移除不必要的元素（脚本、样式、导航等）
- 保存为 .md 文件到 generated/ 目录
- 保持良好的 Markdown 格式

### 9. html-to-json.js
将爬取的网页转换为结构化的 JSON 格式。

运行：
```bash
node html-to-json.js <URL>
# 示例
node html-to-json.js https://example.com
```

功能：
- 提取页面的所有结构化信息
- 包含元数据、标题、链接、图片、段落、列表、表格等
- 生成详细的统计信息
- 保存为 .json 文件到 generated/ 目录
- 便于后续的数据处理和分析

## 主要特性

- **并发控制**: 限制同时进行的请求数量
- **速率限制**: 控制请求频率避免被封禁
- **错误处理**: 完善的错误处理和重试机制
- **HTML 解析**: 使用 Cheerio 或 JSDOM 解析页面
- **响应处理**: 提取状态码、头部信息和内容

## 常用配置选项

```javascript
const c = new Crawler({
    maxConnections: 10,     // 最大并发连接数
    rateLimit: 1000,        // 请求间隔（毫秒）
    timeout: 10000,         // 请求超时时间
    retries: 3,             // 重试次数
    headers: {              // 请求头部
        'User-Agent': 'Mozilla/5.0...'
    }
});
```

## 注意事项

1. 爬取网站前请检查网站的 robots.txt
2. 遵守网站的使用条款
3. 不要过于频繁的请求以避免被封禁
4. 考虑添加适当的延迟和错误处理

## 关于 node-crawler

[node-crawler](https://github.com/bda-research/node-crawler) 是一个功能强大的 Node.js 网页爬虫库，基于 Cheerio 和 request 模块构建。

### 主要特点

- **简单易用**: 提供简洁的 API 接口
- **jQuery 语法**: 使用 Cheerio 进行 DOM 解析，支持 jQuery 语法
- **并发控制**: 内置连接池和并发限制
- **速率限制**: 支持请求频率控制
- **错误处理**: 完善的错误处理和重试机制
- **代理支持**: 支持 HTTP/HTTPS 代理
- **编码处理**: 自动处理字符编码

### 核心概念

#### Crawler 实例
```javascript
const Crawler = require('crawler');
const c = new Crawler(options);
```

#### 队列管理
```javascript
c.queue(url);           // 添加单个URL
c.queue([url1, url2]); // 添加多个URL
c.queue({              // 添加带参数的请求
    uri: url,
    callback: function(error, res, done) {
        // 处理响应
        done();
    }
});
```

#### 回调函数
```javascript
callback: function(error, res, done) {
    if (error) {
        console.error(error);
    } else {
        // res.$ 包含 Cheerio 实例
        const $ = res.$;
        const title = $('title').text();
    }
    done(); // 必须调用 done()
}
```

### 事件监听

```javascript
c.on('request', function(options) {
    console.log('请求开始:', options.uri);
});

c.on('drain', function() {
    console.log('所有请求完成');
});
```

### 高级功能

#### 动态代理
```javascript
const c = new Crawler({
    rotateUA: true,
    userAgent: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    ]
});
```

#### 自定义请求选项
```javascript
c.queue({
    uri: url,
    method: 'POST',
    form: { key: 'value' },
    headers: {
        'Authorization': 'Bearer token'
    }
});
```

#### 直接处理 HTML
```javascript
c.queue({
    html: '<html><body><h1>Test</h1></body></html>',
    callback: function(error, res, done) {
        // 直接处理 HTML 字符串
        done();
    }
});
```