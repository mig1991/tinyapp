/* eslint-disable func-style */

//Dependencies & Configuration
const express = require("express");
const { urlDatabase, userDatabase } = require("./userData");
const cookieParser = require("cookie-parser");
const { addNewUser, generateRandomID } = require("./userHelpers");

const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
app.use(cookieParser());

//Middleware

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

//register

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // if email and pass are empty, send message
  if (!email || !password) {
    console.log("Error: email and password fields need to be filled.");
    return res.status(400).send("Email and password fields need to be filled.");
  }

  // if email is already registered, send 400 message
  for (const userID in userDatabase) {
    if (userDatabase[userID].email === email) {
      console.log("Error: email is already registered.");
      return res.status(400).send("Email is already registered.");
    }
  }

  const newUser = {
    id: generateRandomID(),
    email: email,
    password: password,
  };

  userDatabase[newUser.id] = newUser;
  console.log("New user registered:", userDatabase);

  res.cookie("user_id", newUser.id);
  res.redirect("/urls");
});

//Other

// login form
app.post("/login", (req, res) => {
  const username = req.body.username; // grab username from form submission
  res.cookie("username", username); // create cookie - 'username'
  res.redirect("/urls"); // redirect back to urls
});

//logout form
app.post("/logout", (req, res) => {
  res.clearCookie("username"); // Clear the username cookie
  res.redirect("/urls"); // Redirect to the main page or login page
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
