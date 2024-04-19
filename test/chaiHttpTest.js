const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const app = require("../express_server");

chai.use(chaiHttp);

describe("Access Control", function() {
  let agent;

  before(function() {
    agent = chai.request.agent(app);
  });

  after(function() {
    agent.close();
  });

  it("should redirect to /login if not logged in when accessing '/'", function(done) {
    agent
      .get("/")
      .end((err, res) => {
        expect(res).to.have.status(302);
        expect(res.redirects[0]).to.match(/\/login$/);  // Checks redirection endpoint
        done();
      });
  });

  it("should redirect to /login if not logged in when accessing '/urls/new'", function(done) {
    agent
      .get("/urls/new")
      .end((err, res) => {
        expect(res).to.have.status(302);
        expect(res.redirects[0]).to.match(/\/login$/);
        done();
      });
  });

  it("should return 404 if the URL does not exist", function(done) {
    agent
      .post("/login")
      .send({ email: "user@example.com", password: "password" })
      .then(() => {
        agent.get("/urls/NOTEXISTS").end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
      });
  });

  it("should return 403 if the user does not own the URL", function(done) {
    agent
      .post("/login")
      .send({ email: "user@example.com", password: "password" })  // Ensure this user does NOT own 'b2xVn2'
      .then(() => {
        agent.get("/urls/b2xVn2").end((err, res) => {
          expect(res).to.have.status(403);
          done();
        });
      });
  });
});
