import Crawler from 'crawler';

const c = new Crawler({
    maxConnections: 5,
    rateLimit: 1000,
    callback: (error, res, done) => {
        if (error) {
            console.error(`Error crawling ${res.options.url}:`, error);
        } else {
            const url = res.options.url;
            
            console.log(`\n=== ${url} ===`);
            console.log(`Status: ${res.statusCode}`);
            console.log(`Content-Type: ${res.headers['content-type']}`);
            
            // Check if response has HTML content
            if (res.$) {
                const $ = res.$;
                const title = $('title').text();
                console.log(`Title: ${title}`);
                
                const paragraphs = $('p').length;
                const images = $('img').length;
                const links = $('a').length;
                
                console.log(`Paragraphs: ${paragraphs}`);
                console.log(`Images: ${images}`);
                console.log(`Links: ${links}`);
                
                const firstParagraph = $('p').first().text().trim();
                if (firstParagraph) {
                    console.log(`First paragraph: ${firstParagraph.substring(0, 100)}...`);
                }
            } else {
                // For non-HTML content
                console.log(`Title: Not available (non-HTML content)`);
                
                try {
                    // Try to parse as JSON
                    const jsonData = JSON.parse(res.body);
                    console.log(`JSON data keys: ${Object.keys(jsonData).join(', ')}`);
                    if (jsonData.title) {
                        console.log(`Title from JSON: ${jsonData.title}`);
                    }
                } catch (e) {
                    // Not JSON, show content length
                    console.log(`Content length: ${res.body.length} bytes`);
                    console.log(`Content preview: ${res.body.substring(0, 100)}...`);
                }
            }
        }
        done();
    }
});

const urls = [
    'http://example.com',
    'https://httpbin.org/html',
    'https://jsonplaceholder.typicode.com/posts/1',
    'https://httpbin.org/json'
];

console.log('Starting to crawl multiple URLs...');
urls.forEach(url => {
    c.queue(url);
});

c.on('drain', () => {
    console.log('\nAll crawling completed!');
});