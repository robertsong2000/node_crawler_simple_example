import fs from 'fs';
import path from 'path';
import Crawler from 'crawler';

const url = process.argv[2];

if (!url) {
    console.log('使用方法: node guoxue-markdown-crawler.js <URL>');
    console.log('示例: node guoxue-markdown-crawler.js https://www.guoxuemeng.com/guoxue/551521.html');
    process.exit(1);
}

// 创建 markdown 目录（如果不存在）
const markdownDir = path.join(process.cwd(), 'markdown');
if (!fs.existsSync(markdownDir)) {
    fs.mkdirSync(markdownDir, { recursive: true });
}

console.log(`开始提取古籍内容: ${url}`);
console.log(`保存目录: ${markdownDir}\n`);

// 清理文本，移除多余的空白字符
function cleanText(text) {
    return text.replace(/\s+/g, ' ').trim();
}

// 将HTML内容转换为Markdown格式
function htmlToMarkdown($, element) {
    let markdown = '';
    
    $(element).contents().each((i, node) => {
        if (node.type === 'text') {
            const text = cleanText($(node).text());
            if (text) {
                markdown += text;
            }
        } else if (node.type === 'tag') {
            const tagName = node.name.toLowerCase();
            const $node = $(node);
            
            switch (tagName) {
                case 'a':
                    const href = $node.attr('href');
                    const linkText = cleanText($node.text());
                    if (linkText && href) {
                        // 如果是相对链接，转换为绝对链接
                        const absoluteHref = href.startsWith('http') ? href : `https://www.guoxuemeng.com${href}`;
                        markdown += `[${linkText}](${absoluteHref})`;
                    } else if (linkText) {
                        markdown += linkText;
                    }
                    break;
                case 'p':
                case 'div':
                    const text = cleanText($node.text());
                    if (text) {
                        markdown += `\n\n${text}`;
                    }
                    break;
                case 'br':
                    markdown += '\n';
                    break;
                default:
                    // 递归处理其他标签
                    markdown += htmlToMarkdown($, node);
                    break;
            }
        }
    });
    
    return markdown;
}

const c = new Crawler({
    maxConnections: 1,
    rateLimit: 1000,
    timeout: 15000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    callback: (error, res, done) => {
        if (error) {
            console.error('❌ 提取失败:', error.message);
            done();
            return;
        }
        
        if (res.statusCode !== 200) {
            console.error(`❌ 请求失败，状态码: ${res.statusCode}`);
            done();
            return;
        }
        
        if (!res.$) {
            console.error('❌ 页面解析失败');
            done();
            return;
        }
        
        const $ = res.$;
        
        // 提取页面标题（h1标签）
        const title = $('h1').first().text().trim();
        console.log(`📄 提取标题: ${title}`);
        
        // 提取作者信息
        const authorInfo = $('.lainfo').text().trim();
        console.log(`👤 作者信息: ${authorInfo}`);
        
        // 提取正文内容（从 .lacontent div 中提取）
        const contentDiv = $('.lacontent');
        let content = '';
        
        if (contentDiv.length > 0) {
            // 移除广告和不需要的元素
            contentDiv.find('script').remove();
            contentDiv.find('.clearfix').remove();
            
            // 提取段落内容
            contentDiv.find('p').each((i, elem) => {
                const $p = $(elem);
                const text = cleanText($p.text());
                
                // 跳过关键词段落和空段落
                if (text && !text.startsWith('关键词：')) {
                    // 处理段落中的链接
                    const markdown = htmlToMarkdown($, elem);
                    content += markdown + '\n\n';
                }
            });
        }
        
        // 如果没有找到内容，尝试其他选择器
        if (!content.trim()) {
            console.log('⚠️ 使用.lacontent未找到内容，尝试其他方式...');
            
            // 寻找包含主要内容的其他可能容器
            const possibleSelectors = ['.gxbl', '.content', '.article', '.main'];
            
            for (const selector of possibleSelectors) {
                const container = $(selector);
                if (container.length > 0) {
                    container.find('p').each((i, elem) => {
                        const text = cleanText($(elem).text());
                        if (text && !text.startsWith('关键词：')) {
                            content += text + '\n\n';
                        }
                    });
                    if (content.trim()) break;
                }
            }
        }
        
        if (!content.trim()) {
            console.error('❌ 未找到正文内容');
            done();
            return;
        }
        
        // 生成Markdown文件名
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.replace(/[^a-zA-Z0-9]/g, '_');
        const pathname = urlObj.pathname.replace(/[^a-zA-Z0-9]/g, '_') || 'index';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${hostname}${pathname}_${timestamp}.md`;
        const filepath = path.join(markdownDir, filename);
        
        // 构建Markdown内容
        let markdownContent = `# ${title}\n\n`;
        
        if (authorInfo) {
            markdownContent += `> ${authorInfo}\n\n`;
        }
        
        markdownContent += `**原文链接:** [${url}](${url})\n\n`;
        markdownContent += `**提取时间:** ${new Date().toLocaleString('zh-CN')}\n\n`;
        markdownContent += '---\n\n';
        markdownContent += content.trim();
        
        // 保存Markdown文件
        fs.writeFileSync(filepath, markdownContent, 'utf8');
        
        console.log('\n=== 提取结果 ===');
        console.log(`📄 标题: ${title}`);
        console.log(`📝 内容长度: ${content.length} 字符`);
        console.log(`💾 保存路径: ${filepath}`);
        console.log(`🔗 原文链接: ${url}\n`);
        
        // 显示内容预览（前200字符）
        const preview = content.substring(0, 200).replace(/\n/g, ' ');
        console.log(`📖 内容预览: ${preview}${content.length > 200 ? '...' : ''}\n`);
        
        console.log(`✅ Markdown文件已保存到: ${filepath}`);
        done();
    }
});

c.queue(url);

c.on('drain', () => {
    console.log('\n✅ 古籍内容提取完成！');
});