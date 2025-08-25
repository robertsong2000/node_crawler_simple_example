import fs from 'fs';
import path from 'path';
import TurndownService from 'turndown';
import Crawler from 'crawler';

const url = process.argv[2];

if (!url) {
    console.log('使用方法: node html-to-markdown.js <URL>');
    console.log('示例: node html-to-markdown.js https://example.com');
    process.exit(1);
}

// 创建 generated 目录
const generatedDir = path.join(process.cwd(), 'generated');
if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
}

// 初始化 TurndownService
const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
});

// 自定义转换规则
turndownService.addRule('strikethrough', {
    filter: ['del', 's', 'strike'],
    replacement: function(content) {
        return '~~' + content + '~~';
    }
});

console.log(`开始爬取并转换为 Markdown: ${url}`);

const c = new Crawler({
    maxConnections: 1,
    rateLimit: 1000,
    timeout: 15000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    callback: (error, res, done) => {
        if (error) {
            console.error('❌ 爬取失败:', error.message);
            done();
            return;
        }
        
        if (res.statusCode !== 200) {
            console.error(`❌ 请求失败，状态码: ${res.statusCode}`);
            done();
            return;
        }
        
        // 生成文件名
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.replace(/[^a-zA-Z0-9]/g, '_');
        const pathname = urlObj.pathname.replace(/[^a-zA-Z0-9]/g, '_') || 'index';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${hostname}${pathname}_${timestamp}.md`;
        const filepath = path.join(generatedDir, filename);
        
        let markdownContent = '';
        
        if (res.$) {
            const $ = res.$;
            
            // 提取页面元数据
            const title = $('title').text();
            const description = $('meta[name="description"]').attr('content') || '';
            
            // 创建 Markdown 头部
            markdownContent += `# ${title}\n\n`;
            markdownContent += `**URL**: ${url}\n\n`;
            markdownContent += `**描述**: ${description}\n\n`;
            markdownContent += `---\n\n`;
            
            // 移除不需要的元素
            $('script, style, nav, header, footer, .ad, .advertisement, .sidebar').remove();
            
            // 获取主要内容
            let mainContent = $('main, article, .content, .main, #content').first();
            if (mainContent.length === 0) {
                mainContent = $('body');
            }
            
            // 转换为 Markdown
            const htmlContent = mainContent.html() || '';
            markdownContent += turndownService.turndown(htmlContent);
            
            // 清理和格式化
            markdownContent = markdownContent
                .replace(/\n{3,}/g, '\n\n')  // 移除多余的空行
                .replace(/^\s+|\s+$/g, '');   // 移除首尾空格
        }
        
        // 保存 Markdown 文件
        fs.writeFileSync(filepath, markdownContent, 'utf8');
        
        console.log('✅ 转换完成！');
        console.log(`📄 保存路径: ${filepath}`);
        console.log(`📊 字符数: ${markdownContent.length}`);
        
        done();
    }
});

c.queue(url);

c.on('drain', () => {
    console.log('\n✅ 所有处理完成！');
});