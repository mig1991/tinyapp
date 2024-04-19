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
const PORT = process.env.PORT || 8080;

app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Database

//Listener

//Routes

//Home Route

app.get("/", (req, res) => {
  const userID = req.session.user_id;
  if (userID && userDatabase[userID]) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//Index - show all urls

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID || !userDatabase[userID]) {
    return res.status(401).render("error", { message: "You must be logged in to view URLs." });
  }
  const userURLs = urlsForUser(userID);
  res.render("urls_index", { urls: userURLs, user: userDatabase[userID] });
});



app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID || !userDatabase[userID]) {
    return res.status(403).send("You must be logged in to shorten URLs.");
  }

  const longURL = req.body.longURL;
  const shortURL = generateRandomID();

  urlDatabase[shortURL] = { longURL: longURL, userID: userID }; // save url to user
  const newURL = req.protocol + '://' + req.get('host') + '/u/' + shortURL; // Construct the complete short URL
  res.render("new_short_url", { newURL }); // Render a template containing the clickable link
});

//new url form
app.get("/urls/new", (req, res) => {
  if (req.session && req.session.user_id) {
    res.render("urls_new", { user: userDatabase[req.session.user_id] });
  } else {
    res.redirect("/login");
  }
});

//Read - show one url
//GET /urls/:id -> id is a placeholder

app.get("/urls/:id", (req, res) => {
  if (!req.session || !req.session.user_id) {
    return res.status(401).send("Log in required");
  }
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).send("URL not found");
  }
  if (url.userID !== req.session.user_id) {
    return res.status(403).send("Access denied");
  }
  res.render("urls_show", {
    id: req.params.id,
    longURL: url.longURL,
    user: userDatabase[req.session.user_id],
  });
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
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];

  // If user is not logged in
  if (!userID) {
    return res.status(401).render("error", { message: "You must be logged in to view this URL." });
  }

  // If URL for the given ID does not exist
  if (!url) {
    return res.status(404).render("error", { message: "URL not found." });
  }

  // If user is logged in but does not own the URL with the given ID
  if (url.userID !== userID) {
    return res.status(403).render("error", { message: "You do not have permission to view this URL." });
  }

  // Render HTML with site header and form containing the corresponding long URL and update button
  res.render("urls_show", {
    id: shortURL,
    longURL: url.longURL,
    user: userDatabase[userID],
  });
});
//Save

//REGISTER

app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = userDatabase[userID]; // Retrieve user data from the database if logged in
  res.render("register", { user }); // Pass the user data to the template
});


app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Check if email or password is empty
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty.");
  }

  // Validate email and password
  const { valid, error } = validateRegistration(email, password);
  if (!valid) {
    return res.status(400).send(error);
  }

  // Check if email already exists
  const userExists = findUserViaEmail(email, userDatabase);
  if (userExists) {
    return res.status(400).send("This email is already registered.");
  }

  // Add new user to the database
  const { user, error: userError } = addNewUser(email, password, userDatabase);
  if (userError) {
    return res.status(400).send(userError);
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
});
//Other

// login forms

app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.redirect("/urls"); // or some other page for logged-in users
  }
});

app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const user = userDatabase[userID] || null; // Ensure user is defined

  res.render("login", { user }); // Pass the user variable to the template
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
  req.session = null;  // This clears the session completely, effectively removing the session cookie
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}!`);
  });
}

module.exports = app;
