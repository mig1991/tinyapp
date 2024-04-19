/* eslint-disable func-style */
const helpers = {};
const { urlDatabase, userDatabase } = require("./userData");
const bcrypt = require("bcryptjs");


// generates random id
helpers.generateRandomID = () => {
  const letters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let result = "";
  const lettersLength = letters.length;
  for (let i = 0; i < 6; i++) {
    result += letters.charAt(Math.floor(Math.random() * lettersLength));
  }
  return result;
};

// function that makes adding a new user easier
helpers.addNewUser = (email, password, userDatabase) => {
  if (!email || !password) {
    return { user: null, error: "Please fill in both fields" };
  }

  for (const key in userDatabase) {
    if (userDatabase[key].email === email) {
      return { user: null, error: "Email already registered" };
    }
  }

  const hashedPassword = bcrypt.hashSync(password, 5);  // hashing pass
  const newID = helpers.generateRandomID();
  const newUser = {
    id: newID,
    email: email,
    password: hashedPassword, //storing hashed pass
  };

  userDatabase[newID] = newUser;
  return { user: newUser, error: null };
};

helpers.validateRegistration = (email, password) => {
  if (!email || !password) {
    return { valid: false, error: "Fill out email and password" };
  }
  return { valid: true, error: null };
};

helpers.findUserViaEmail = (email, userDatabase) => {
  for (const userID in userDatabase) {
    if (userDatabase[userID].email === email) {
      return userDatabase[userID]; // return user as object
    }
  }
  return null; // user not found
};

helpers.userURLs = (id) => {
  const filteredUrls = {};
  for (const urlId in urlDatabase) {
    if (urlDatabase[urlId].userID === id) {
      filteredUrls[urlId] = urlDatabase[urlId];
    }
  }
  return filteredUrls;
};



helpers.urlsForUser = (id) => {
  let urls = {};
  for (let urlId in urlDatabase) {
    if (urlDatabase[urlId].userID === id) {
      urls[urlId] = urlDatabase[urlId];
    }
  }
  return urls;
};


module.exports = helpers;
