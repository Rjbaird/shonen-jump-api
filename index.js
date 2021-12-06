// shonen-jump-api

const PORT = process.env.PORT || 8000;

const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

const app = express();

const manga_list = [];

app.get('/', (req, res) => {
    const welcome = {
        title: 'Welcome to the unofficial shonen-jump-api',
        description:'An API showing data about English translations of Weekly Shonen Jump',
        repo: 'https://github.com/Rjbaird/shonen-jump-api',
        help: 'https://github.com/Rjbaird/shonen-jump-api/issues',
        RapidAPI: 'https://rapidapi.com/Rjbaird/api/unofficial-shonen-jump',
        endpoints:['/all', '/schedule']
    }
    res.json(welcome)
})

app.get('/all', async (req, res) => {
    const url = 'https://www.viz.com/shonenjump'
    axios(url)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html);
            let all_manga = $('.o_sortable')
            let chapter_num_regex = /\d+/g;
            all_manga.each((i, e) => {
                let title = $(e).find('img').attr('alt');
                let manga_link = $(e).find('a').attr('href');
                let newest_chapter_link = $(e).find('.o_inner-link').attr('href');
                let latest_chapter_number = $(e).find('span').first().text().trim().match(chapter_num_regex)
                let latest_chapter_date = $(e).find('.style-italic').first().text().trim();
                const viz = 'https://www.viz.com'
                const chapter_object = {
                    'title': `${title}`,
                    'manga_link': `${viz}${manga_link}`,
                    'newest_chapter_link': `${viz}${newest_chapter_link}`,
                    'latest_chapter_date': parseChapterDate(latest_chapter_date),
                    'latest_chapter_number': parseChapterNumber(latest_chapter_number),
                }
                manga_list[i] = chapter_object;
            })
            res.json(manga_list)
        }).catch(err => console.log(err))

})

app.get('/schedule', async (req, res) => {
    const url = 'https://www.viz.com/shonen-jump-chapter-schedule'
    axios(url)
        .then(response => {
            const html = response.data
            const chapterReleases = [];
            const $ = cheerio.load(html);
            let table_row = $('tr');
            let chapter_regex = /Ch\.\s\d+/g;
            let chapter_num_regex = /\d+/g;
            let next_release_regex = /\w\w\w,\s\w\w\w\s\d+/g;
            table_row.each((i, e) => {
                let row = $(e).text()
                let title = row.split(',', 1)
                let upcoming_chapter = row.match(chapter_regex)
                let num_of_chapters = `${upcoming_chapter}`.match(chapter_num_regex)
                let next_chapter_release_date = row.match(next_release_regex)
                const chapter_object = {
                    'title': `${title}`,
                    'chapter_release': parseInt(num_of_chapters),
                    'upcoming_chapter': `${upcoming_chapter}`,
                    'next_chapter_release_date': `${next_chapter_release_date}`,
                }
                chapterReleases[i] = chapter_object;
            })
            chapterReleases.shift()
            chapterReleases.pop()
            res.json(chapterReleases)
        }).catch(err => console.log(err))


})

function parseChapterNumber(recent_chapter) {
    if (recent_chapter == null) {
        return 'Special One-Shot!'
    }
    return recent_chapter.toString()
}

function parseChapterDate(date_string) {
    if (date_string == '') {
        return 'NA'
    }
    return date_string
}

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));