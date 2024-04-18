/* eslint-disable func-style */

//Dependencies & Configuration
const express = require("express");
const { urlDatabase, userDatabase } = require("./userData");
const cookieParser = require("cookie-parser");
const {
  addNewUser,
  generateRandomID,
  validateRegistration,
  findUserViaEmail,
} = require("./userHelpers");

const app = express();
const PORT = 8080;

//Middleware
app.set("view engine", "ejs");
app.use(cookieParser());
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
  const userID = req.cookies["user_id"]; // retrieve user_id from cookie
  const user = userDatabase[userID]; // lookup user object; assign to user

  const templateVars = {
    urls: urlDatabase,
    user: user, // pass the entire user object
  };
  res.render("urls_index", templateVars);
});

//Create - form submission and make new short url
//

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomID();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//new url form
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = userDatabase[userID];

  if (!user) {
    res.redirect("/login");
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
  const id = req.params.id;
  const longURL = urlDatabase[id];

  const userID = req.cookies["user_id"];
  const user = userDatabase[userID];

  if (!user) {
    res.redirect("/login"); //redirect if no user found
  } else {
    const templateVars = {
      id: id,
      longURL: longURL,
      user: user,
    };

    res.render("urls_show", templateVars);
  }
});

//Update - saving submission from the "Edit URL" form
//post /urls/:name

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id; // grab short url
  const newUrl = req.body.newLongURL; // grab new url
  urlDatabase[shortURL] = newUrl; // update database
  res.redirect("/urls"); // Redirect the user to the list of all urls
});

//Delete url

app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params; // extract id from the url
  delete urlDatabase[id]; // delete url
  res.redirect("/urls"); // redirect to list of urls
});

//Edit

//

//Redirect
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  res.redirect(urlDatabase[shortURL]);
});

//Save

//REGISTER

app.get("/register", (req, res) => {
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
  res.cookie("user_id", user.id, { httpOnly: true });
  res.redirect("/urls");
});
//Other

// login forms

app.get("/login", (req, res) => {
  res.render("login"); // Assuming your login.ejs file is ready
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // does email exist
  const user = findUserViaEmail(email, userDatabase);
  if (!user) {
    return res.status(403).send("User with that email does not exist.");
  }

  // is password correct
  if (user.password !== password) {
    return res.status(403).send("Password is incorrect.");
  }

  // set cookie, redirect
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

//logout form
app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); // Clear the id cookie
  res.redirect("/login"); // Redirect to the main page or login page
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
