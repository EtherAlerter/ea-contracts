/* eslint-env node, mocha */
/* eslint no-unused-expressions: 0 */
const Alerter = artifacts.require('../contracts/Alerter.sol'); // eslint-disable-line no-undef
const expectThrow = require('./helpers/expectThrow.js');
const BigNumber = require('bignumber.js');

const should = require('chai') // eslint-disable-line no-unused-vars
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('Alerter', (accounts) => {
  const creator = accounts[0];
  const owner = accounts[1];
  const cust1 = accounts[2];
  // const cust2 = accounts[3];
  const smsprice = new web3.BigNumber(web3.toWei(0.0001, 'ether')); // eslint-disable-line no-undef
  const newsmsprice = new web3.BigNumber(web3.toWei(0.0003, 'ether')); // eslint-disable-line no-undef
  const emailprice = new web3.BigNumber(web3.toWei(0.00001, 'ether')); // eslint-disable-line no-undef
  const webhookprice = new web3.BigNumber(web3.toWei(0.0, 'ether')); // eslint-disable-line no-undef

  let alerter;
  before(async () => {
    alerter = await Alerter.new();
    await alerter.transferOwnership(owner);
  });

  beforeEach(async () => {
  });

  context('define alert types and prices', () => {
    it('should fail to create a new alert type when not the owner', async () => {
      // should not be callable by anyone but the owner
      await expectThrow(alerter.addAlertType('fail', 101, { from: cust1 }));
    });

    it('should create a new alert type', async () => {
      await alerter.addAlertType('SMS', smsprice, { from: owner });
      (web3.toUtf8(await alerter.getAlertTypeName(0))).should.be.equal('SMS');
      (await alerter.getAlertTypeActive(0)).should.be.true;
      (await alerter.getAlertTypePrice(0)).should.be.bignumber.equal(smsprice);
    });

    it('should create more alert types', async () => {
      await alerter.addAlertType('Email', emailprice, { from: owner });
      (web3.toUtf8(await alerter.getAlertTypeName(1))).should.be.equal('Email');
      (await alerter.getAlertTypeActive(1)).should.be.true;
      (await alerter.getAlertTypePrice(1)).should.be.bignumber.equal(emailprice);
      await alerter.addAlertType('Webhook', webhookprice, { from: owner });
      (web3.toUtf8(await alerter.getAlertTypeName(2))).should.be.equal('Webhook');
      (await alerter.getAlertTypeActive(2)).should.be.true;
      (await alerter.getAlertTypePrice(2)).should.be.bignumber.equal(webhookprice);
    });

    it('non-owners should not be able to change the price of an alert type', async () => {
      // should not be callable by anyone but the owner
      await expectThrow(alerter.setAlertTypePrice(0, smsprice, { from: creator }));
    });

    it('should change the price of an alert type', async () => {
      await alerter.setAlertTypePrice(0, newsmsprice, { from: owner });
      (await alerter.getAlertTypePrice(0)).should.be.bignumber.equal(newsmsprice);
      await alerter.setAlertTypePrice(0, smsprice, { from: owner });
    });

    it('non-owners should not be able to retire an alert type', async () => {
      await expectThrow(alerter.setAlertTypeActive(0, false, { from: creator }));
    });

    it('should retire an alert type', async () => {
      await alerter.setAlertTypeActive(0, false, { from: owner });
      (await alerter.getAlertTypeActive(0)).should.be.false;
      await alerter.setAlertTypeActive(0, true, { from: owner });
      (await alerter.getAlertTypeActive(0)).should.be.true;
    });

    it('should validate alert types', async () => {
      await expectThrow(alerter.getAlertTypePrice(8));
      await expectThrow(alerter.setAlertTypePrice(8, newsmsprice, { from: owner }));
      await expectThrow(alerter.getAlertTypeActive(8));
      await expectThrow(alerter.setAlertTypeActive(8, true, { from: owner }));
    });
  });

  context('manage deposits', () => {
    it('should have insufficient funds for an SMS', async () => {
      (await alerter.getAlertBalance(0, cust1)).toNumber().should.be.equal(0);
    });
    it('should have no funds to refund', async () => {
      await expectThrow(alerter.refundDepositBalance({ from: cust1 }));
    });
    it('should deposit funds for one SMS', async () => {
      await web3.eth.sendTransaction({ from: cust1, to: alerter.address, value: smsprice });
      (await alerter.getDepositBalance(cust1)).should.be.bignumber.equal(smsprice);
    });
    it('should have funds for one SMS', async () => {
      (await alerter.getAlertBalance(0, cust1)).toNumber().should.be.equal(1);
    });
    it('should refund deposited balance on request', async () => {
      await alerter.refundDepositBalance({ from: cust1 });
    });
  });

  context('create subscription', () => {
    xit('should create a new subscription given a value of the alert type', async () => {
      assert(true);
    });

    xit('should create another subscription given that the balance on account is 100x the price of an alert type', async () => {
      assert(true);
    });
  });

  context('fail to create subscription due to insufficient funds', () => {
    xit('should fail to create a subscription', async () => {
      assert(true);
    });

    xit('should allow user to add funds', async () => {
      assert(true);
    });

    xit('should allow user to create a subscription', async () => {
      assert(true);
    });

    xit('should fail to create a subscription for an alert type for which there are insufficient funds, < 10x', async () => {
    });
  });

  context('cancel subscription', () => {
    xit('should create a subscription', async () => {
      assert(true);
    });

    xit('should cancel the subscription', async () => {
      assert(true);
    });

    xit('should get their money back', async () => {
      assert(true);
    });
  });
});
