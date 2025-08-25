import Crawler from 'crawler';

const url = process.argv[2];

if (!url) {
    console.log('使用方法: node crawl-cli.js <URL>');
    console.log('示例: node crawl-cli.js https://example.com');
    process.exit(1);
}

console.log(`开始爬取: ${url}\n`);

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
        
        if (!res.$) {
            console.error('❌ 响应内容不是HTML格式');
            done();
            return;
        }
        
        const $ = res.$;
        
        console.log('=== 爬取结果 ===');
        console.log(`URL: ${url}`);
        console.log(`状态码: ${res.statusCode}`);
        console.log(`内容类型: ${res.headers['content-type']}\n`);
        
        // 页面标题
        const title = $('title').text();
        console.log(`📄 页面标题: ${title}\n`);
        
        // 页面描述
        const description = $('meta[name="description"]').attr('content');
        if (description) {
            console.log(`📝 页面描述: ${description}\n`);
        }
        
        // 主要标题
        console.log('📋 页面标题:');
        $('h1, h2, h3').each((i, elem) => {
            const tagName = $(elem).prop('tagName');
            const text = $(elem).text().trim();
            if (text) {
                console.log(`  ${tagName}: ${text}`);
            }
        });
        console.log('');
        
        // 链接统计
        const totalLinks = $('a[href]').length;
        const externalLinks = $('a[href^="http"]').length;
        console.log(`🔗 链接统计:`);
        console.log(`  总链接数: ${totalLinks}`);
        console.log(`  外部链接: ${externalLinks}\n`);
        
        // 图片统计
        const images = $('img').length;
        const imagesWithAlt = $('img[alt]').length;
        console.log(`🖼️ 图片统计:`);
        console.log(`  总图片数: ${images}`);
        console.log(`  有描述的图片: ${imagesWithAlt}\n`);
        
        // 段落统计
        const paragraphs = $('p').length;
        console.log(`📝 段落数量: ${paragraphs}`);
        
        // 前5个外部链接
        console.log('\n🔗 主要外部链接:');
        $('a[href^="http"]').slice(0, 5).each((i, elem) => {
            const href = $(elem).attr('href');
            const text = $(elem).text().trim();
            console.log(`  ${href} (${text || '无文本'})`);
        });
        
        done();
    }
});

c.queue(url);

c.on('drain', () => {
    console.log('\n✅ 爬取完成！');
});