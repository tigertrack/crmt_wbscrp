const superagent = require('superagent');
const cheerio = require('cheerio');
const Promise = require('bluebird');
const { resolve } = require('bluebird');
const fs = require('fs');
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
 });

}

async function main(){
    console.log('fetching links...')
    let links = await getLinks();
    console.log('fetching article details...')
    let details = await Promise.map(links, function(link) {
        return getDetails(link);
    });
    console.log('exporting to json...')
    await fs.writeFile('solution.json',  JSON.stringify({articles : details}), () => {})
    console.log('Done!')
}

main();