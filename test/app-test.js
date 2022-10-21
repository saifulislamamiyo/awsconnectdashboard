const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const {campaignModel} = require('../libs/dbmodels')

chai.should();
chai.use(chaiHttp);


describe("CRUD test on DynamoDB.CloudCall_Campaign_Table",()=>{
  let test_campaign_name = `Test Campaign ${Date.now()}`;
  it(`it should create a new campaign named: ${test_campaign_name}`, async ()=>{
    const resp = await campaignModel.create({campaign_name:test_campaign_name, status: true, hoursOfOperationId: 'HoOx', id: String(Date.now())})
    resp.should.equal(true);
  });
  it(`it should list all campaigns`, async ()=>{
    const resp = await campaignModel.list()
    resp.should.have.lengthOf.above(0);
  });
  it(`it should search for the campaign named: ${test_campaign_name}`, async()=>{
    const resp = await campaignModel.search(test_campaign_name)
    resp.should.have.lengthOf.above(0);
  }); 
  it(`it should update the campaign named: ${test_campaign_name}`, async()=>{
    let hooId = 'green green grass'
    let resp = await campaignModel.update({hoursOfOperationId: hooId}, test_campaign_name);
    resp.should.equal(true);
    resp = await campaignModel.search(test_campaign_name)
    resp.should.have.lengthOf.above(0);
    resp[0].hoursOfOperationId.should.equal(hooId);   
  });   
});

// /* Test the /GET route */
// describe('app index route', () => {
//   it('it should GET /', (done) => {
//     chai.request(app)
//       .get('/')
//       .end((err, res) => {
//         res.should.have.status(200);
//         done();
//       });
//   });

//   it('it should handle 404 error', (done) => {
//     chai.request(app)
//       .get('/notExist')
//       .end((err, res) => {
//         res.should.have.status(404);
//         done();
//       });
//   });
// });
