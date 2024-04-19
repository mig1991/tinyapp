/* eslint-disable func-style */

//Dependencies & Configuration
const express = require("express");
const cookieSession = require("cookie-session");
const { urlDatabase, userDatabase } = require("./userData");
const {
  addNewUser,
  generateRandomID,
  validateRegistration,
  findUserViaEmail,
  userURLs: urlsForUser,
} = require("./helpers");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080;

//Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

//Database

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
  const userID = req.session.user_id;
  if (!userID || !userDatabase[userID]) {
    const message =
      "Please Log in First. Please <a href='/login'>login</a> or <a href='/register'>register</a>.";
    return res.status(401).send(`<html><body>${message}</body></html>`);
  }

  const userURLs = urlsForUser(userID); // get the urls for logged in user
  const templateVars = {
    urls: userURLs,
    user: userDatabase[userID],
  };
  res.render("urls_index", templateVars);
});

//Create - form submission and make new short url
//

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID || !userDatabase[userID]) {
    return res.status(403).send("You must be logged in to shorten URLs.");
  }

  const longURL = req.body.longURL;
  const shortURL = generateRandomID();

  urlDatabase[shortURL] = { longURL: longURL, userID: userID }; // save url to user
  res.redirect(`/urls/${shortURL}`);
});

//new url form
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = userDatabase[userID];

  if (!userID || !userDatabase[userID]) {
    return res.redirect("/login");
  } else {
    const templateVars = {
      user: user,
    };
    res.render("urls_new", templateVars);
  }
});

//Read - show one url
//GET /urls/:id -> id is a placeholder

app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const user = userDatabase[userID];
  const shortURL = req.params.id;

  // if user is not logged in, show message with hyperlinks
  if (!userID || !user) {
    const message =
      "Log in to view this page. Please <a href='/login'>login</a> or <a href='/register'>register</a>.";
    return res.status(401).send(`<html><body>${message}</body></html>`);
  }

  // if url doesnt exist, show error message
  const url = urlDatabase[shortURL];
  if (!url) {
    return res
      .status(404)
      .send("<html><body><h1>404 Error: URL not found</h1></body></html>");
  }

  // if user doesn't own url, then show no access message
  if (url.userID !== userID) {
    return res
      .status(403)
      .send(
        "<html><body><h1>403 Access Denied: You do not have access to this URL.</h1></body></html>"
      );
  }

  const templateVars = {
    id: shortURL,
    longURL: url.longURL,
    user: user,
  };
  res.render("urls_show", templateVars);
});

//Update - saving submission from the "Edit URL" form
//post /urls/:name

app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;
  const newLongURL = req.body.newLongURL;

  // if url doesnt exist, give 404 error
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("URL does not exist.");
  }

  // if user is not logged in, send 401 error
  if (!userID) {
    return res.status(401).send("You must be logged in to edit URLs.");
  }

  // if user is logged in but doesnt own the url
  if (urlDatabase[shortURL].userID !== userID) {
    return res.status(403).send("You do not have permission to edit this URL.");
  }

  // update url
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect("/urls");
});

//Delete url

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;

  // if url doesnt exist, give 404 error
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("URL does not exist.");
  }

  // if user is not logged in, send 401 error
  if (!userID) {
    return res.status(401).send("You must be logged in to delete URLs.");
  }

  // if user is logged in but doesnt own the url
  if (urlDatabase[shortURL].userID !== userID) {
    return res
      .status(403)
      .send("You do not have permission to delete this URL.");
  }

  // delete URL
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Edit

//

//Redirect
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("404 Error");
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//Save

//REGISTER

app.get("/register", (req, res) => {
  const userID = req.session.user_id; //grab user id from cookie
  if (userID && userDatabase[userID]) {
    return res.redirect("/urls");
  }
  res.render("register");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const { valid, error } = validateRegistration(email, password);
  if (!valid) {
    return res.status(400).send(error);
  }
  const userExists = findUserViaEmail(email, userDatabase);
  if (userExists) {
    return res.status(400).send("This email is already registered.");
  }
  const { user, error: userError } = addNewUser(email, password, userDatabase);
  if (userError) {
    return res.status(400).send(userError);
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});
//Other

// login forms

app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  if (userID && userDatabase[userID]) {
    return res.redirect("/urls");
  }
  res.render("login"); // render the login page if not logged in
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // does email exist
  const user = findUserViaEmail(email, userDatabase);
  if (!user) {
    return res.status(403).send("User with that email does not exist.");
  }

  // is password correct
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Password incorrect.");
  }
  // set cookie, redirect
  req.session.user_id = user.id;
  res.redirect("/urls");
});

//logout form
app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect("/login"); // Redirect to the main page or login page
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
