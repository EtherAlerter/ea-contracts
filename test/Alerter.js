
const Alerter = artifacts.require('../contracts/Alerter.sol'); // eslint-disable-line no-undef
const expectThrow = require('./helpers/expectThrow.js');

contract('Alerter', accounts => {
  const creator = accounts[0];
  const owner = accounts[1];
  const cust1 = accounts[2];
  const cust2 = accounts[3];
  const smsprice = new web3.BigNumber(web3.toWei(0.0001, 'ether')); // eslint-disable-line no-undef
  const emailprice = new web3.BigNumber(web3.toWei(0.00001, 'ether')); // eslint-disable-line no-undef
  const webhookprice = new web3.BigNumber(web3.toWei(0.0, 'ether')); // eslint-disable-line no-undef

  let alerter;
  before(async () => {
    alerter = await Alerter.new();
    await alerter.transferOwnership(owner);
  })

  beforeEach( async() => {
  })

  context('define alert types and prices', () => {
    it('should fail to create a new alert type when not the owner', async () => {
      // should not be callable by anyone but the owner
      await expectThrow(alerter.addAlertType("fail", 101, { from: cust1 }));
    })

    it('should create a new alert type', async () => {
      await alerter.addAlertType("SMS", smsprice, { from: owner });
      assert("SMS" === web3.toUtf8(await alerter.getAlertTypeName(0)));
      assert(await alerter.getAlertTypeActive(0));
      assert.deepEqual(smsprice, await alerter.getAlertTypePrice(0));
    })

    it('should create more alert types', async () => {
      await alerter.addAlertType("Email", emailprice, { from: owner });
      assert("Email" === web3.toUtf8(await alerter.getAlertTypeName(1)));
      assert(await alerter.getAlertTypeActive(1));
      assert.deepEqual(emailprice, await alerter.getAlertTypePrice(1));
      await alerter.addAlertType("Webhook", webhookprice, { from: owner });
      assert("Webhook" === web3.toUtf8(await alerter.getAlertTypeName(2)));
      assert(await alerter.getAlertTypeActive(2));
      assert.deepEqual(webhookprice, await alerter.getAlertTypePrice(2));
    })

    xit('should change the price of an alert type', async () => {
      // should not be callable by anyone but the owner
      assert(true);
    })

    xit('should retire an alert type', async () => {
      // should not be callable by anyone but the owner
      assert(true);
    })
  })

  context('create subscription', () => {
    xit('should create a subscription given 100x the price of an alert type', async () => {
      assert(true);
    })

    xit('should create another subscription given that the balance on account is 100x the price of an alert type', async () => {
      assert(true);
    })
  })

  context('fail to create subscription due to insufficient funds', () => {
    xit('should fail to create a subscription', async () => {
      assert(true);
    })

    xit('should allow user to add funds', async () => {
      assert(true);
    })

    xit('should allow user to create a subscription', async () => {
      assert(true);
    })

    xit('should fail to create a subscription for an alert type for which there are insufficient funds, < 10x', async () => {
    })
  })

  context('cancel subscription', () => {
    let sub;
    xit('should create a subscription', async () => {
      assert(true);
    })

    xit('should cancel the subscription', async () => {
      assert(true);
    })

    xit('should get their money back', async () => {
      assert(true);
    })
  })
});
