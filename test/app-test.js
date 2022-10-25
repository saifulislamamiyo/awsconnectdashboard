const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const { campaignModel } = require('../libs/dbmodels')

chai.should();
chai.use(chaiHttp);


describe("CRUD test on DynamoDB.CloudCall_Campaign_Table", () => {
  let test_campaign_name = `Test Campaign ${Date.now()}`;
  it(`it should create a new campaign named: ${test_campaign_name}`, async () => {
    const resp = await campaignModel.create({ campaign_name: test_campaign_name, status: true, hours_of_operation_id: 'HoO2', id: String(Date.now()), created_at: String(Date.now()), author: "1001" })
    resp.should.equal(true);
  });
  it(`it should list all campaigns`, async () => {
    const resp = await campaignModel.list()
    resp.should.have.lengthOf.above(0);
  });
  it(`it should search for the campaign named: ${test_campaign_name}`, async () => {
    const resp = await campaignModel.search(test_campaign_name)
    resp.should.have.lengthOf.above(0);
  });
  it(`it should update the campaign named: ${test_campaign_name}`, async () => {
    let hooId = 'green green grass'
    let resp = await campaignModel.update({ hours_of_operation_id: hooId }, test_campaign_name);
    resp.should.equal(true);
    resp = await campaignModel.search(test_campaign_name)
    resp.should.have.lengthOf.above(0);
    resp[0].hours_of_operation_id.should.equal(hooId);
  });
});