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