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
        endpoints:['/all', '/schedule', '/manga/:mangaID']
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
                let manga_slug = manga_link.replace('/shonenjump/chapters/', '').trim()
                let newest_chapter_link = $(e).find('.o_inner-link').attr('href');
                let latest_chapter_number = $(e).find('span').first().text().trim().match(chapter_num_regex)
                let latest_chapter_date = $(e).find('.style-italic').first().text().trim();
                const viz = 'https://www.viz.com'
                const chapter_object = {
                    'title': `${title}`,
                    'manga_slug': `${manga_slug}`,
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

app.get('/manga/:mangaID', async (req, res) => {
    const { mangaID } = req.params;
    const url = `https://www.viz.com/shonenjump/chapters/${mangaID}`;
    axios(url)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);
            let recommended_manga = []
            let title = $('#series-intro').find('h2').text();
            let header_image = $('.o_hero-media').attr('src');
            let author = $('.disp-bl--bm').text().replace('Created by ', '');
            let description = $('h4', '.mar-t-rg').text();
            let next_release_date = $('.section_future_chapter').text().trim();
            $('.o_property-link')
                .each(function (i, e) {
                    let rec_title = $(this).attr('rel');
                    let rec_slug = $(this).attr('href').replace('/shonenjump/chapters/', '');
                    let rec_link = $(this).attr('href');
                    let recommendation_obj = {
                        'title': rec_title,
                        'title_slug': rec_slug,
                        'link': `https://www.viz.com${rec_link}`,
                    }
                    recommended_manga[i] = recommendation_obj;
                });
            recommended_manga.join(', ');
            const manga_object = {
                'title': `${title}`,
                'header_image': `${header_image}`,
                'author': `${author}`,
                'description': `${description}`,
                'next_release_countdown': parseChapterDate(next_release_date),
                'recommended_manga': recommended_manga,
            }
            res.json(manga_object)
        }).catch(err => console.log(err))
})

function parseChapterNumber(recent_chapter) {
    if (recent_chapter == null) {
        return 'Special One-Shot!'
    }
    return recent_chapter.toString()
}

function parseChapterDate(date_string) {
    if (date_string == '' || date_string == null) {
        return 'NA'
    }
    return date_string
}


app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));