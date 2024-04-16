/* eslint-disable func-style */

//Dependencies & Configuration
const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//Middleware

function generateUrlSafeRandomString() {
  const letters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let result = "";
  const lettersLength = letters.length;
  for (let i = 0; i < 6; i++) {
    result += letters.charAt(Math.floor(Math.random() * lettersLength));
  }
  return result;
}

app.use(express.urlencoded({ extended: true }));

//Database

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  s9m5xK: "http://www.google.com",
  v8xskF: "http://www.youtube.com",
  g5fCvS: "http://www.facebook.com",
};

//Listener

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Routes

//Home Route

app.get("/", (req, res) => {
  res.send("Hello!");
});

//Index - show all urls

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies['username'] // retrieve the username from cookies
  };
  res.render("urls_index", templateVars);
});


//Create - form submission and make new short url
//

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateUrlSafeRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//new url form
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies['username'] // pass the username cookie to the template
  };
  res.render("urls_new", templateVars);
});


//Read - show one url
//GET /urls/:id -> id is a placeholder

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = {
    id: id,
    longURL: longURL,
    username: req.cookies['username'] // pass the username cookie to the template
  };
  res.render("urls_show", templateVars);
});

//Update - Saving submission from the "Edit URL" form
//post /urls/:name

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;  // grab short url
  const newUrl = req.body.newLongURL;  // grab new url
  urlDatabase[shortURL] = newUrl;  // update database
  res.redirect('/urls');  // Redirect the user to the list of all urls
});

//Delete url

app.post('/urls/:id/delete', (req, res) => {
  const { id } = req.params; // extract id from the url
  delete urlDatabase[id]; // delete url
  res.redirect('/urls'); // redirect to list of urls
});

//Edit

//

//Redirect
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  res.redirect(urlDatabase[shortURL]);
});

//Save



//Other
// login form
app.post('/login', (req, res) => {
  const username = req.body.username;  // grab username from form submission
  res.cookie('username', username);    // create cookie - 'username'
  res.redirect('/urls');               // redirect back to urls
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

