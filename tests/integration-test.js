const chai = require('chai');
const chaiHttp = require('chai-http');
const {app} = require('../index.js');

const { expect } = chai;
chai.use(chaiHttp);

describe('Health Check', () => {
  it('should return 200 OK', (done) => {
    chai
      .request(app)
      .get('/healthz')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});