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




app.listen(PORT, () => {
  console.log('listening here on port 3k')
})