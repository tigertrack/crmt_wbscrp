const superagent = require('superagent');
const cheerio = require('cheerio');
const Promise = require('bluebird');
const { resolve } = require('bluebird');
const fs = require('fs');
const { exit } = require('process');
const baseUrl = 'https://www.cermati.com';

function getDetails(url){
    let result = superagent
    .get(baseUrl + url)
    .then((res) => {
        const $ = cheerio.load(res.text);
        let result = {
            url : baseUrl + url,
            title : $('h1.post-title').text().trim(),
            author : $('span.author-name').text().trim(),
            postingDate : $('span.post-date').text().trim(),
            relatedArticles : $('#body > div.container.content > div > div.col-lg-3 > div:nth-child(3) > div > ul')
                .find('li')
                .toArray()
                .map(el => {
                    return {
                        url : $(el).find('a').attr('href'),
                        title : baseUrl +  $(el).find('a > h5').text()
                    }
                }),
        }
        return result;
    })
    return result;
}

function getLinks(){
    let links = [];
    return superagent
    .get(baseUrl + '/artikel')
    .then((res) => {
        const $ = cheerio.load(res.text);
        $('.article-list-item a').each((i, el) => {
            const $el = $(el);
            links.push($el.attr('href'))
        })
        return links ;
        })
    .catch(err => {
        return err
        // if(err.code == 'ENOTFOUND') return 'URL not found. Check baseUrl variable on solution.js'
        // else 'Unexpected error, owww mann, here we go againn..'
    });

}

async function main(){
    console.log('Opening url...')
    let links = await getLinks();
    if (links.length === 0){
        console.log('Failed to scrap article elements. Check getLinks function to fix this problem.')
        exit()
    }
    console.log('fetching article details...')
    let details = await Promise.map(links, function(link) {
        return getDetails(link);
    });
    console.log('exporting to json...')
    await fs.writeFile('solution.json',  JSON.stringify({articles : details}), () => {})
    console.log('Done!')
}

main();