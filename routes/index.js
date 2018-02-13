const express = require('express');
const router = express.Router();
const request = require('request'); 
const cheerio = require("cheerio"); 
const Articles = require('../models/articles');
const Comments = require('../models/comments');

// GET '/' Display main page
router.get('/', (req, res) => {
    res.render('index', { mainPage: true} );
});

// GET '/scrape' 
router.get('/scrape', (req, res) => { 
    Articles.remove({saved: false}).exec();

    //My problems are here. i have tried numerous websites and when they all didn't work, i stuck to trying to get my fav
    //web page to work, and it isn't.
    
    const motogpURL = "https://www.motogp.com/en/";  // Making the request to get the HTML

    request(motogpURL, (err, response, html) => {    // Making request to get the HTML code
        if (err) { console.log(error) };    // Check for errors
        
        const $ = cheerio.load(html); 
        
        let motogpResult = [];   // store results to move to dB
        let motogpParentSelector = "row_1"; 

        $(motogpParentSelector).each( (i, element) => {
            motogpResult.push({
                title: $(element).find('thumb_container.h2').text(),
                body: $(element).find('thumb_container.summary').text(),
                url: $(element).find('a').attr('href'),
                source: "MotoGP",
                saved: false
            });
        });

        

        Articles.create(motogpResult)
            .then( dbArticle => {
                res.render('scrape', {articles: dbArticle, title: "Check the results"});
            })
            .catch( err => {
                console.error(err);
                res.redirect('/');
            })
    });
});

// GET '/save/:id' Saves article 
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

// POST '/save/comments/:postCommentID' Create comments 
router.post('/save/comments/:postCommentID', (req, res) => {
    Comments.create(req.body)
        .then(dbComment => Articles.findByIdAndUpdate(req.params.postCommentID, { comments: dbComment._id }, { new: true}))
        .then( dbArticle => res.redirect('/save'))
        .catch( err => console.error(err));
});

// GET '/save/comments/:getCommentID' Display comments 
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