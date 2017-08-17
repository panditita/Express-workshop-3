const express = require('express');
const app = express();
const exphbs  = require('express-handlebars');

// Then these two lines after you initialise your express app 
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// The extensions 'html' allows us to serve file without adding .html at the end 
// i.e /my-cv will server /my-cv.html
app.use(express.static("public", {'extensions': ['html']}));

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/my-cv', function (req, res) {
    res.render('my-cv');
});

app.get('/admin', function (req, res) {
    res.render('admin');
});

app.get('/contact', function (req, res) {
    res.render('contact');
});

// what does this line mean: process.env.PORT || 3000
app.listen(process.env.PORT || 3000, function () {
  console.log("Server is listening on port 3000. Ready to accept requests!");
});