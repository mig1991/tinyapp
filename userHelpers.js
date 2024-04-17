/* eslint-disable func-style */
const userHelpers = {};

userHelpers.addNewUser = (email, password, userDatabase) => {
  if (!email || !password) {
    return { user: null, error: "Please fill in both fields" };
  }

  for (const key in userDatabase) {
    if (userDatabase[key].email === email) {
      return { user: null, error: "Email already registered" };
    }
  }

  const newUser = {
    email,
    password,
  };

  return { user: newUser, error: null };
};

module.exports = userHelpers;
