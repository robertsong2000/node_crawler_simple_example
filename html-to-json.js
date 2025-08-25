import fs from 'fs';
import path from 'path';
import Crawler from 'crawler';

const url = process.argv[2];

if (!url) {
    console.log('使用方法: node html-to-json.js <URL>');
    console.log('示例: node html-to-json.js https://example.com');
    process.exit(1);
}

// 创建 generated 目录
const generatedDir = path.join(process.cwd(), 'generated');
if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
}

console.log(`开始爬取并转换为 JSON: ${url}`);

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
        const filename = `${hostname}${pathname}_${timestamp}.json`;
        const filepath = path.join(generatedDir, filename);
        
        const jsonData = {
            metadata: {
                url: url,
                timestamp: new Date().toISOString(),
                statusCode: res.statusCode,
                headers: res.headers,
                contentLength: res.body.length
            },
            content: {
                rawHtml: res.body.toString()
            }
        };
        
        if (res.$) {
            const $ = res.$;
            
            // 提取基本信息
            jsonData.content.title = $('title').text();
            jsonData.content.description = $('meta[name="description"]').attr('content') || '';
            jsonData.content.keywords = $('meta[name="keywords"]').attr('content') || '';
            jsonData.content.author = $('meta[name="author"]').attr('content') || '';
            
            // 提取标题结构
            jsonData.content.headings = [];
            $('h1, h2, h3, h4, h5, h6').each((i, elem) => {
                const $elem = $(elem);
                jsonData.content.headings.push({
                    level: parseInt($elem.prop('tagName').substring(1)),
                    text: $elem.text().trim(),
                    id: $elem.attr('id') || ''
                });
            });
            
            // 提取链接
            jsonData.content.links = [];
            $('a[href]').each((i, elem) => {
                const $elem = $(elem);
                const href = $elem.attr('href');
                if (href) {
                    jsonData.content.links.push({
                        url: href,
                        text: $elem.text().trim(),
                        title: $elem.attr('title') || '',
                        isExternal: href.startsWith('http') && !href.includes(urlObj.hostname)
                    });
                }
            });
            
            // 提取图片
            jsonData.content.images = [];
            $('img').each((i, elem) => {
                const $elem = $(elem);
                const src = $elem.attr('src');
                if (src) {
                    jsonData.content.images.push({
                        src: src.startsWith('http') ? src : new URL(src, url).href,
                        alt: $elem.attr('alt') || '',
                        title: $elem.attr('title') || '',
                        width: $elem.attr('width') || '',
                        height: $elem.attr('height') || ''
                    });
                }
            });
            
            // 提取段落
            jsonData.content.paragraphs = [];
            $('p').each((i, elem) => {
                const text = $(elem).text().trim();
                if (text.length > 0) {
                    jsonData.content.paragraphs.push(text);
                }
            });
            
            // 提取列表
            jsonData.content.lists = [];
            $('ul, ol').each((i, elem) => {
                const $elem = $(elem);
                const items = [];
                $elem.find('li').each((j, li) => {
                    const text = $(li).text().trim();
                    if (text) {
                        items.push(text);
                    }
                });
                if (items.length > 0) {
                    jsonData.content.lists.push({
                        type: $elem.prop('tagName').toLowerCase(),
                        items: items
                    });
                }
            });
            
            // 提取表格
            jsonData.content.tables = [];
            $('table').each((i, elem) => {
                const $elem = $(elem);
                const table = {
                    headers: [],
                    rows: []
                };
                
                // 提取表头
                $elem.find('th').each((j, th) => {
                    table.headers.push($(th).text().trim());
                });
                
                // 提取表格行
                $elem.find('tr').each((j, tr) => {
                    const row = [];
                    $(tr).find('td').each((k, td) => {
                        row.push($(td).text().trim());
                    });
                    if (row.length > 0) {
                        table.rows.push(row);
                    }
                });
                
                if (table.headers.length > 0 || table.rows.length > 0) {
                    jsonData.content.tables.push(table);
                }
            });
            
            // 统计信息
            jsonData.content.stats = {
                totalLinks: jsonData.content.links.length,
                externalLinks: jsonData.content.links.filter(link => link.isExternal).length,
                totalImages: jsonData.content.images.length,
                imagesWithAlt: jsonData.content.images.filter(img => img.alt).length,
                totalParagraphs: jsonData.content.paragraphs.length,
                totalHeadings: jsonData.content.headings.length,
                totalLists: jsonData.content.lists.length,
                totalTables: jsonData.content.tables.length
            };
        }
        
        // 保存 JSON 文件
        fs.writeFileSync(filepath, JSON.stringify(jsonData, null, 2), 'utf8');
        
        console.log('✅ 转换完成！');
        console.log(`📄 保存路径: ${filepath}`);
        console.log(`📊 数据大小: ${JSON.stringify(jsonData).length} 字符`);
        
        if (jsonData.content.stats) {
            console.log('📈 内容统计:');
            console.log(`  链接: ${jsonData.content.stats.totalLinks} (外部: ${jsonData.content.stats.externalLinks})`);
            console.log(`  图片: ${jsonData.content.stats.totalImages} (有描述: ${jsonData.content.stats.imagesWithAlt})`);
            console.log(`  段落: ${jsonData.content.stats.totalParagraphs}`);
            console.log(`  标题: ${jsonData.content.stats.totalHeadings}`);
            console.log(`  列表: ${jsonData.content.stats.totalLists}`);
            console.log(`  表格: ${jsonData.content.stats.totalTables}`);
        }
        
        done();
    }
});

c.queue(url);

c.on('drain', () => {
    console.log('\n✅ 所有处理完成！');
});