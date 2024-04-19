const { assert } = require('chai');

const { findUserViaEmail: findUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID, "The user ID should match the expected user ID.");
  });

  it('should return null for a non-existent email', function() {
    const user = findUserByEmail("doesntexist@yahoo.com", testUsers);
    assert.isNull(user, "no user should be returned for a non-existent email.");
  });
});