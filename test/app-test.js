const chai = require('chai');
const chaiHttp = require('chai-http');

const app = require('../app');

chai.should();
chai.use(chaiHttp);


describe("CRUD test on DynamoDB.CloudCall_Campaign_Table ",()=>{
  it('', (done)=>{
    
  });
});

/* Test the /GET route */
describe('app index route', () => {
  it('it should GET /', (done) => {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it('it should handle 404 error', (done) => {
    chai.request(app)
      .get('/notExist')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});
