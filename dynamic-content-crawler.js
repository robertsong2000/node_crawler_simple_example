import Crawler from 'crawler';
import { JSDOM } from 'jsdom';

const c = new Crawler({
    maxConnections: 3,
    jQuery: false,
    callback: (error, res, done) => {
        if (error) {
            console.error('Error:', error);
            done();
            return;
        }

        try {
            const dom = new JSDOM(res.body);
            const document = dom.window.document;
            
            console.log(`\n=== ${res.options.uri} ===`);
            console.log(`Status: ${res.statusCode}`);
            
            const title = document.querySelector('title')?.textContent || 'No title';
            console.log(`Title: ${title}`);
            
            const headings = document.querySelectorAll('h1, h2, h3');
            console.log(`Found ${headings.length} headings:`);
            headings.forEach((heading, index) => {
                console.log(`  ${index + 1}. ${heading.tagName}: ${heading.textContent.trim()}`);
            });
            
            const scripts = document.querySelectorAll('script');
            const externalScripts = Array.from(scripts).filter(script => script.src);
            console.log(`Found ${externalScripts.length} external scripts`);
            
            const forms = document.querySelectorAll('form');
            console.log(`Found ${forms.length} forms`);
            
            const metaTags = document.querySelectorAll('meta');
            const description = Array.from(metaTags).find(tag => 
                tag.getAttribute('name') === 'description'
            );
            if (description) {
                console.log(`Description: ${description.getAttribute('content')}`);
            }
            
            const links = document.querySelectorAll('a[href]');
            const uniqueLinks = new Set();
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#')) {
                    uniqueLinks.add(href);
                }
            });
            console.log(`Found ${uniqueLinks.size} unique links`);
            
        } catch (parseError) {
            console.error('Error parsing HTML:', parseError);
        }
        
        done();
    }
});

const dynamicPages = [
    'https://httpbin.org/html',
    'http://example.com',
    'https://jsonplaceholder.typicode.com/'
];

console.log('Crawling pages with advanced DOM processing...');
dynamicPages.forEach(url => {
    c.queue(url);
});

c.on('drain', () => {
    console.log('\nDynamic content crawling completed!');
});