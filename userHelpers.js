/* eslint-disable func-style */
const userHelpers = {};
const { urlDatabase, userDatabase } = require("./userData");


// generates random id
userHelpers.generateRandomID = () => {
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
userHelpers.addNewUser = (email, password, userDatabase) => {
  if (!email || !password) {
    return { user: null, error: "Please fill in both fields" };
  }

  for (const key in userDatabase) {
    if (userDatabase[key].email === email) {
      return { user: null, error: "Email already registered" };
    }
  }

  const newID = userHelpers.generateRandomID();
  const newUser = {
    id: newID,
    email,
    password,
  };

  userDatabase[newID] = newUser;
  return { user: newUser, error: null };
};

userHelpers.validateRegistration = (email, password) => {
  if (!email || !password) {
    return { valid: false, error: "Fill out email and password" };
  }
  return { valid: true, error: null };
};

userHelpers.findUserViaEmail = (email, userDatabase) => {
  for (const userID in userDatabase) {
    if (userDatabase[userID].email === email) {
      return userDatabase[userID]; // return user as object
    }
  }
  return null; // user not found
};

userHelpers.userURLs = (id) => {
  const filteredUrls = {};
  for (const urlId in urlDatabase) {
    if (urlDatabase[urlId].userID === id) {
      filteredUrls[urlId] = urlDatabase[urlId];
    }
  }
  return filteredUrls;
};

module.exports = userHelpers;
