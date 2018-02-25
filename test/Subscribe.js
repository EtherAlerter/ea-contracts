

contract('Alerter', accounts => {
  before(async () => {
  })

  beforeEach( async() => {
  })

  context('define alert types and prices', () => {
    xit('should create a new alert type', async () => {
      // should not be callable by anyone but the owner
      assert(true);
    })

    xit('should create more alert types', async () => {
      assert(true);
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
    xit('should create a subscription given 10x the price of an alert type', async () => {
      assert(true);
    })

    xit('should create another subscription given that the balance on account is 10x the price of an alert type', async () => {
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
