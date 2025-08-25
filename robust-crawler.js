import Crawler from 'crawler';

const retryCount = new Map();
const maxRetries = 3;

const c = new Crawler({
    maxConnections: 2,
    rateLimit: 2000,
    timeout: 10000,
    retryTimeout: 5000,
    retries: maxRetries,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    callback: (error, res, done) => {
        const url = res.options.url;
        
        if (error) {
            const currentRetries = retryCount.get(url) || 0;
            
            console.error(`Error crawling ${url}:`, error.message);
            console.log(`Attempt ${currentRetries + 1}/${maxRetries}`);
            
            if (currentRetries < maxRetries - 1) {
                retryCount.set(url, currentRetries + 1);
                console.log(`Retrying ${url} in 5 seconds...`);
                
                setTimeout(() => {
                    c.queue(url);
                }, 5000);
            } else {
                console.log(`Max retries reached for ${url}`);
                retryCount.delete(url);
            }
        } else {
            retryCount.delete(url);
            
            console.log(`\n✅ Successfully crawled: ${url}`);
            console.log(`Status: ${res.statusCode}`);
            console.log(`Content-Type: ${res.headers['content-type']}`);
            console.log(`Content-Length: ${res.body.length} bytes`);
            
            try {
                const $ = res.$;
                const title = $('title').text();
                console.log(`Title: ${title}`);
                
                const server = res.headers['server'];
                if (server) {
                    console.log(`Server: ${server}`);
                }
                
                const responseTime = res.options.elapsedTime;
                console.log(`Response time: ${responseTime}ms`);
                
                const robots = res.headers['x-robots-tag'];
                if (robots) {
                    console.log(`Robots directive: ${robots}`);
                }
                
            } catch (parseError) {
                console.error('Error parsing response:', parseError.message);
            }
        }
        
        done();
    }
});

const urls = [
    'http://example.com',
    'https://httpbin.org/status/200',
    'https://httpbin.org/delay/2',
    'https://httpbin.org/html',
    'http://httpstat.us/200'
];

console.log('Starting robust crawling with error handling...');
console.log(`Max retries: ${maxRetries}`);
console.log(`Timeout: 10 seconds`);
console.log(`Rate limit: 2 seconds between requests\n`);

urls.forEach(url => {
    retryCount.set(url, 0);
    c.queue(url);
});

c.on('drain', () => {
    console.log('\n🎉 All crawling operations completed!');
    console.log(`Remaining retry tracking: ${retryCount.size} URLs`);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});