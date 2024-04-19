const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);


const appUrl = 'http://localhost:8080'; // Update with your actual app URL

// Create a Chai agent for making requests
const agent = chai.request.agent(appUrl);

describe('TinyApp Security Features', () => {
  // Test case 1
  it('should redirect GET / to /login with status 302', () => {
    return agent
      .get('/')
      .then((res) => {
        expect(res).to.redirect;
        expect(res).to.redirectTo(`${appUrl}/login`);
        // expect(res).to.have.status(302);
      });
  });
});



// describe("Access Control", function() {
//   let agent;

//   before(function() {

//   });

//   agent = chai.request.agent(app);
  
//   after(function() {
//     agent.close();
//   });

//   it("should redirect to /login if not logged in when accessing '/'", function(done) {
//     return agent
//       .get("/")
//       .then((res) => {
//         expect(res).to.have.status(302);
//         expect(res.redirects[0]).to.match(/\/login$/);  // Checks redirection endpoint
//         done();
//       });
//   });

//   it("should redirect to /login if not logged in when accessing '/urls/new'", function(done) {
//     agent
//       .get("/urls/new")
//       .end((err, res) => {
//         expect(res).to.have.status(302);
//         expect(res.redirects[0]).to.match(/\/login$/);
//         done();
//       });
//   });

//   it("should return 404 if the URL does not exist", function(done) {
//     agent
//       .post("/login")
//       .send({ email: "user@example.com", password: "password" })
//       .then(() => {
//         agent.get("/urls/NOTEXISTS").end((err, res) => {
//           expect(res).to.have.status(404);
//           done();
//         });
//       });
//   });

//   it("should return 403 if the user does not own the URL", function(done) {
//     agent
//       .post("/login")
//       .send({ email: "user@example.com", password: "password" })  // Ensure this user does NOT own 'b2xVn2'
//       .then(() => {
//         agent.get("/urls/b2xVn2").end((err, res) => {
//           expect(res).to.have.status(403);
//           done();
//         });
//       });
//   });
// });
