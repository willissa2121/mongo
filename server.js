var express = require('express');
var logger = require('morgan');
var mongoose = require('mongoose');
var axios = require('axios');
var cheerio = require('cheerio');

var PORT = process.env.PORT || 8000;


var app = express()

app.use(express.static('public'))

app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/populated", { useNewUrlParser: true });
var db = require('./models')

// db.Library.create({ title: 'filler' })

app.get('/all', (req, res) => {
  db.Library.find({}).then(response => {
    console.log(response)
    res.json(response)
  })

})

app.get('/notes', (req, res) => {
  db.Notes.find({}).then(response => {
    res.json(response)
  }).catch(err => {
    console.log(err)
  })
})

// db.Library.deleteMany({}, () => {
//   console.log('worked')
// })

// db.Notes.deleteMany({}, () => {
//   console.log('worked')
// })

app.post('/', (req, res) => {
  console.log(req.body);

  db.Notes.create(req.body).then(response => {
    console.log(response)
  }).catch(err => {
    console.log(err);
  })
  res.redirect('/')
})

app.get('/scraped', (req, res) => {
  axios.get('https://www.npr.org/sections/politics/').then(response => {
    var $ = cheerio.load(response.data);
    var results = [];
    $('h2.title').each(function (i, element) {
      var result = {}
      result.title = ($(element).children().attr('href'))
      // console.log(result.title)

      $('p.teaser').each(function (i, element) {
        result.description = ($(element).children().text())

        db.Library.create(result).then(response => {

        }).catch(err => {
          console.log(err)
        })
      })



    }).catch(err => {
      console.log(err)
    })
  }).catch(err => {
    console.log(err)
  })
})

app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});




app.listen(PORT, () => {
  console.log('listening here on port 3k')
})