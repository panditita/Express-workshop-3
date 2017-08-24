const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const fs = require('fs');
const bodyParser = require('body-parser');
// Load the SDK for JavaScript
var AWS = require('aws-sdk');







// Then these two lines after you initialise your express app 
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Load credentials and set region from JSON file
AWS.config.loadFromPath('./config.json');

// The extensions 'html' allows us to serve file without adding .html at the end 
// i.e /my-cv will server /my-cv.html
app.use(express.static("public", { 'extensions': ['html'] }));


app.get('/api/posts', function (req, res) {
    const filePath = __dirname + '/data/posts.json';

    var options = {
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    res.sendFile(filePath, options, function (err) {
        if (err) {
            next(err);
        } else {
            console.log('Sent:', filePath);
        }
    });
});

app.get('/', function (req, res) {

    var docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName: "cyf-Etza-posts",
        ProjectionExpression: "title, summary, content",
    };

    console.log("Scanning posts table.");
    docClient.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // print all the posts
            console.log("Scan succeeded.");
            data.Items.forEach(function (post) {
                console.log(
                    post.title + ": ",
                    post.summary, "- content:",
                    post.content);
            });

            res.render('index', {
                title: "Etza's profile",
                subheading: "A modern Website built in Node with Handlebars",
                posts: data.Items
            });
        }
    }
});

app.get('/my-cv', function (req, res, next) {


    // no error? good. I'll do normal stuff here
    res.render('my-cv');



});




app.get('/admin', function (req, res) {
    res.render('admin');
});

app.get('/contact', function (req, res) {
    res.render('contact');
});


app.post('/admin', function (req, res) {
    // Create the DynamoDB service object 
    var docClient = new AWS.DynamoDB.DocumentClient();

    var params = {

        TableName: 'cyf-Etza-posts',
        Item: {
            'title': req.body.title,
            'summary': req.body.summary,
            'content': req.body.contents,
        }
    };

    // Call DynamoDB to add the item to the table 
    console.log("Adding a new item...");
    docClient.put(params, function (err, data) {

        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
        }
    });
    res.end();

});



//Este crea logs en el archivo post.json 
/* app.post('/admin', function (req, res) {
    const filePath = __dirname + '/data/posts.json';

const cb = function (error, file) {
    // we call .toString() to turn the file buffer to a String
    const fileData = file.toString();
    // we use JSON.parse to get an object out the String
    const postsJson = JSON.parse(fileData);
    // add new post to the file
    postsJson.push(req.body);

    // write back to file
    fs.writeFile(filePath, JSON.stringify(postsJson), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });

    res.end("Success.");
};

fs.readFile(filePath, cb);
});
*/


app.use(function(err, req, res, next) {
    console.log('Internal Server Error');
    res.status(500).send("Internal Server Error");
  });
  
  app.use(function(req, res, next) {
    console.log('Page Not Found');
    res.status(404).send("Page Not Found");
  });

// what does this line mean: process.env.PORT || 3000
app.listen(process.env.PORT || 3000, function () {
    console.log("Server is listening on port 3000. Ready to accept requests!");
});