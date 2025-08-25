import Crawler from 'crawler';

const c = new Crawler({
    maxConnections: 10,
    callback: (error, res, done) => {
        if (error) {
            console.error('Error crawling:', error);
        } else {
            console.log('Status Code:', res.statusCode);
            console.log('Headers:', res.headers);
            
            const $ = res.$;
            console.log('Page Title:', $('title').text());
            console.log('Page H1:', $('h1').text());
            
            const links = [];
            $('a').each((i, elem) => {
                const href = $(elem).attr('href');
                if (href) {
                    links.push(href);
                }
            });
            
            console.log('Found links:', links.slice(0, 5));
        }
        done();
    }
});

console.log('Starting to crawl http://example.com...');
c.queue('http://example.com');