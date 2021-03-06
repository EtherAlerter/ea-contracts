/* eslint-env node, mocha */
/* eslint no-unused-expressions: 0 */
const Alerter = artifacts.require('../contracts/Alerter.sol');
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
  const cust2 = accounts[3];
  const cust3 = accounts[4];
  const cust4 = accounts[5];
  const cust5 = accounts[6];
  const smsprice = new web3.BigNumber(web3.toWei(0.0001, 'ether'));
  const newsmsprice = new web3.BigNumber(web3.toWei(0.0003, 'ether'));
  const emailprice = new web3.BigNumber(web3.toWei(0.00001, 'ether'));
  const webhookprice = new web3.BigNumber(web3.toWei(0.0, 'ether'));

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
      (await alerter.getSubscriberAlertBalance(cust1, 0)).toNumber().should.be.equal(0);
    });

    it('should have no funds to refund', async () => {
      await expectThrow(alerter.refundSubscriberBalance({ from: cust1 }));
    });

    it('should deposit funds for one SMS', async () => {
      await web3.eth.sendTransaction({ from: cust1, to: alerter.address, value: smsprice });
      (await alerter.getSubscriberBalance(cust1)).should.be.bignumber.equal(smsprice);
    });

    it('should have funds for one SMS', async () => {
      (await alerter.getSubscriberAlertBalance(cust1, 0)).toNumber().should.be.equal(1);
    });

    it('should refund deposited balance on request', async () => {
      await alerter.refundSubscriberBalance({ from: cust1 });
    });

    it('should only be able to refund when there is balance', async () => {
      await expectThrow(alerter.refundSubscriberBalance({ from: cust1 }));
    });
  });

  context('create subscription', () => {
    it('should create a new subscription with sent eth', async () => {
      await alerter.createSubscription(0, { from: cust2, value: smsprice });
    });
  });

  context('fail to create subscription due to insufficient funds', () => {
    it('should fail to create a subscription', async () => {
      await expectThrow(alerter.createSubscription(0, { from: cust3 }));
    });

    it('should allow user to add funds', async () => {
      await web3.eth.sendTransaction({ from: cust3, to: alerter.address, value: smsprice });
    });

    it('should have no subscriptions', async () => {
      (await alerter.getSubscriptionCount(cust3)).toNumber().should.be.equal(0);
      (await alerter.getSubscriptionActiveCount(cust3)).toNumber().should.be.equal(0);
    });

    it('should allow user to create a subscription', async () => {
      await alerter.createSubscription(0, { from: cust3 });
    });

    it('should have one subscription', async () => {
      (await alerter.getSubscriptionCount(cust3)).toNumber().should.be.equal(1);
      (await alerter.getSubscriptionActiveCount(cust3)).toNumber().should.be.equal(1);
    });
  });

  context('cancel subscription', () => {
    let id;
    it('should have no subscriptions', async () => {
      (await alerter.getSubscriptionCount(cust4)).toNumber().should.be.equal(0);
      (await alerter.getSubscriptionActiveCount(cust4)).toNumber().should.be.equal(0);
    });

    it('should create a new subscription with sent eth', async () => {
      const result = await alerter.createSubscription(0, { from: cust4, value: smsprice });
      result.logs[1].event.should.be.equal('SubscriptionCreated');
      id = result.logs[1].args.id; // eslint-disable-line prefer-destructuring
    });

    it('should have one subscription', async () => {
      (await alerter.getSubscriptionCount(cust4)).toNumber().should.be.equal(1);
      (await alerter.getSubscriptionActiveCount(cust4)).toNumber().should.be.equal(1);
    });

    it('should cancel the subscription', async () => {
      const result = await alerter.cancelSubscription(id, { from: cust4 });
      result.logs[0].event.should.be.equal('SubscriptionCancelled');
    });

    it('should have one cancelled subscription', async () => {
      (await alerter.getSubscriptionCount(cust4)).toNumber().should.be.equal(1);
      (await alerter.getSubscriptionActiveCount(cust4)).toNumber().should.be.equal(0);
    });

    it('should get their money back', async () => {
      await alerter.refundSubscriberBalance({ from: cust4 });
    });
  });

  context('record alert', () => {
    it('should record the alert when the provider sends it', async () => {
      let result = await alerter.createSubscription(0, { from: cust5, value: smsprice });
      result.logs[1].event.should.be.equal('SubscriptionCreated');
      const id = result.logs[1].args.id; // eslint-disable-line prefer-destructuring
      // subscription should be active
      (await alerter.getSubscriptionActive(cust5, id)).should.be.true;
      (await alerter.getSubscriptionCount(cust5)).toNumber().should.be.equal(1);
      (await alerter.getSubscriptionActiveCount(cust5)).toNumber().should.be.equal(1);
      // should not allow a non-owner to record an alert
      await expectThrow(alerter.recordAlert(0, cust5, id));
      result = await alerter.recordAlert(0, cust5, id, { from: owner });
      result.logs[0].event.should.be.equal('AlertRecorded');
      // should fail to record an alert for a zero-balance customer
      await expectThrow(alerter.recordAlert(0, cust5, id, { from: owner }));
      // subscription should still be active, though
      (await alerter.getSubscriptionActive(cust5, id)).should.be.true;
    });

    it('should have consumed the balance with that alert', async () => {
      await expectThrow(alerter.refundSubscriberBalance({ from: cust5 }));
      // but the subscription should still be active
      (await alerter.getSubscriptionCount(cust5)).toNumber().should.be.equal(1);
      (await alerter.getSubscriptionActiveCount(cust5)).toNumber().should.be.equal(1);
    });

    it('should handle lots of subscriptions', async () => {
      (await alerter.getSubscriptionActive(cust5, 0)).should.be.true;
      await alerter.createSubscription(0, { from: cust5, value: smsprice });
      (await alerter.getSubscriptionActive(cust5, 1)).should.be.true;
      (await alerter.getSubscriptionCount(cust5)).toNumber().should.be.equal(2);
      (await alerter.getSubscriptionActiveCount(cust5)).toNumber().should.be.equal(2);
      await alerter.createSubscription(0, { from: cust5, value: smsprice });
      await alerter.createSubscription(0, { from: cust5 });
      await alerter.createSubscription(0, { from: cust5 });
      await alerter.createSubscription(0, { from: cust5 });
      (await alerter.getSubscriptionCount(cust5)).toNumber().should.be.equal(6);
      (await alerter.getSubscriptionActiveCount(cust5)).toNumber().should.be.equal(6);
      await alerter.cancelSubscription(1, { from: cust5 });
      // can't cancel the same subscription twice
      await expectThrow(alerter.cancelSubscription(1, { from: cust5 }));
      (await alerter.getSubscriptionCount(cust5)).toNumber().should.be.equal(6);
      (await alerter.getSubscriptionActiveCount(cust5)).toNumber().should.be.equal(5);
      (await alerter.getSubscriptionActive(cust5, 1)).should.be.false;
      await alerter.createSubscription(0, { from: cust5 });
      await alerter.createSubscription(0, { from: cust5, value: smsprice });
      await alerter.cancelSubscription(4, { from: cust5 });
      (await alerter.getSubscriptionActive(cust5, 4)).should.be.false;
      (await alerter.getSubscriptionActiveCount(cust5)).toNumber().should.be.equal(6);
      await alerter.createSubscription(0, { from: cust5 });
      (await alerter.getSubscriptionCount(cust5)).toNumber().should.be.equal(9);
    });
  });
});
