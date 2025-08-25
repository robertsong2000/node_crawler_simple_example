import Crawler from 'crawler';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function getUserInput() {
    console.log('=== 网页爬取工具 ===\n');
    
    const url = await askQuestion('请输入要爬取的网页URL: ');
    
    if (!url) {
        console.log('URL 不能为空！');
        rl.close();
        return;
    }
    
    console.log('\n请选择爬取选项 (多选，用逗号分隔):');
    console.log('1. 页面标题');
    console.log('2. 所有标题 (H1, H2, H3, etc.)');
    console.log('3. 所有链接');
    console.log('4. 所有图片');
    console.log('5. 段落文本');
    console.log('6. 元数据信息');
    console.log('7. 全部信息');
    
    const options = await askQuestion('\n请输入选项编号: ');
    const optionList = options.split(',').map(opt => opt.trim());
    
    rl.close();
    
    return { url, optionList };
}

function processPage(url, $, optionList) {
    console.log(`\n=== 爬取结果: ${url} ===`);
    
    if (optionList.includes('7') || optionList.includes('1')) {
        const title = $('title').text();
        console.log(`📄 页面标题: ${title}`);
    }
    
    if (optionList.includes('7') || optionList.includes('2')) {
        console.log('\n📋 页面标题:');
        $('h1, h2, h3, h4, h5, h6').each((i, elem) => {
            const tagName = $(elem).prop('tagName');
            const text = $(elem).text().trim();
            if (text) {
                console.log(`  ${tagName}: ${text}`);
            }
        });
    }
    
    if (optionList.includes('7') || optionList.includes('3')) {
        console.log('\n🔗 页面链接:');
        const links = new Set();
        $('a[href]').each((i, elem) => {
            const href = $(elem).attr('href');
            const text = $(elem).text().trim();
            if (href && href.startsWith('http')) {
                links.add(`${href} (${text || '无文本'})`);
            }
        });
        links.forEach(link => console.log(`  ${link}`));
    }
    
    if (optionList.includes('7') || optionList.includes('4')) {
        console.log('\n🖼️ 页面图片:');
        $('img').each((i, elem) => {
            const src = $(elem).attr('src');
            const alt = $(elem).attr('alt') || '无描述';
            if (src) {
                const fullSrc = src.startsWith('http') ? src : new URL(src, url).href;
                console.log(`  ${fullSrc} (${alt})`);
            }
        });
    }
    
    if (optionList.includes('7') || optionList.includes('5')) {
        console.log('\n📝 段落文本:');
        $('p').each((i, elem) => {
            const text = $(elem).text().trim();
            if (text && text.length > 20) {
                console.log(`  ${text.substring(0, 100)}...`);
            }
        });
    }
    
    if (optionList.includes('7') || optionList.includes('6')) {
        console.log('\n📊 元数据信息:');
        const description = $('meta[name="description"]').attr('content');
        const keywords = $('meta[name="keywords"]').attr('content');
        const author = $('meta[name="author"]').attr('content');
        
        if (description) console.log(`  描述: ${description}`);
        if (keywords) console.log(`  关键词: ${keywords}`);
        if (author) console.log(`  作者: ${author}`);
        
        const linksCount = $('a[href]').length;
        const imagesCount = $('img').length;
        const paragraphsCount = $('p').length;
        
        console.log(`  链接数量: ${linksCount}`);
        console.log(`  图片数量: ${imagesCount}`);
        console.log(`  段落数量: ${paragraphsCount}`);
    }
}

async function main() {
    try {
        const { url, optionList } = await getUserInput();
        
        if (!url) return;
        
        console.log(`\n开始爬取: ${url}`);
        console.log('请稍候...\n');
        
        const c = new Crawler({
            maxConnections: 1,
            rateLimit: 1000,
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
                
                try {
                    processPage(url, res.$, optionList);
                } catch (processError) {
                    console.error('❌ 处理页面内容时出错:', processError.message);
                }
                
                done();
            }
        });
        
        c.queue(url);
        
        c.on('drain', () => {
            console.log('\n✅ 爬取完成！');
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ 程序出错:', error.message);
        process.exit(1);
    }
}

main();