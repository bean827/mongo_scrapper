const express = require('express');
const router = express.Router();
const request = require('request'); // to easily make HTTP request
const cheerio = require("cheerio"); // Scraping tool
const Articles = require('../models/Articles');
const Comments = require('../models/Comments');

// GET '/' Display main page
router.get('/', (req, res) => {
    res.render('index', { mainPage: true} );
});

// GET '/scrape' Scrape news websites
router.get('/scrape', (req, res) => { 
    // Empty db
    Articles.remove({saved: false}).exec();
    
    const wiredURL = "https://www.wired.com/most-recent/";  // Making the request to get the HTML

    request(wiredURL, (err, response, html) => {    // Making request to get the HTML code
        if (err) { console.log(error) };    // Check for errors
        
        const $ = cheerio.load(html);  // Load the HTML into Cheerio 
        
        let wiredResult = [];   // To store all the results to then save them in DB
        let wiredParentSelector = "li.archive-item-component";  // The parent selector element to use

        $(wiredParentSelector).each( (i, element) => {
            wiredResult.push({
                title: $(element).find('h2.archive-item-component__title').text(),
                body: $(element).find('p.archive-item-component__desc').text(),
                url: $(element).find('a').attr('href'),
                source: "Wired",
                saved: false
            });
        });

        

        Articles.create(wiredResult)
            .then( dbArticle => {
                res.render('scrape', {articles: dbArticle, title: "Check the results"});
            })
            .catch( err => {
                console.error(err);
                res.redirect('/');
            })
    });
});

// GET '/save/:id' Saves article for later viewing
router.put('/save/:articleID', (req, res) => {
    Articles.findByIdAndUpdate(req.params.articleID, { $set: {saved: true} }, { new: true })
        .then( article => {
            res.send("Article updated");
        })
        .catch( err => {
            console.error(err);
            res.redirect('/');
        })
});

// GET '/save' Show all saved articles
router.get('/save', (req, res) => {
    Articles.find({ saved: true })
        .then(dbArticles => {
            res.render('savedArticles', { articles: dbArticles, title: "These are your saved articles" });
        })
        .catch( err => {
            console.error(err);
            res.redirect('/');
        })
});

// POST '/save/comments/:postCommentID' Create comments for a specific article
router.post('/save/comments/:postCommentID', (req, res) => {
    Comments.create(req.body)
        .then(dbComment => Articles.findByIdAndUpdate(req.params.postCommentID, { comments: dbComment._id }, { new: true}))
        .then( dbArticle => res.redirect('/save'))
        .catch( err => console.error(err));
});

// GET '/save/comments/:getCommentID' Display comments for a specific article
router.get('/save/comments/:getCommentID', (req, res) => {
    Articles.findById(req.params.getCommentID)
        .populate("comments")
        .then(dbArticles => res.json(dbArticles))
        .catch(err => console.error(err));
})

router.delete('/delete/article/:removeArticleID', (req, res) => {
    Articles.findByIdAndRemove(req.params.removeArticleID)
        .then(dbArticle => {
            res.send("Article removed");
        })
        .catch(err => console.error(err));
})

router.delete('/delete/comment/:commentID', (req, res) => {
    Comments.findByIdAndRemove(req.params.commentID)
        .then(dbComment => {
            res.send("Comment removed");
        })
        .catch(err => console.error(err));
})


module.exports = router;