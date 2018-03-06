pragma solidity ^0.4.19;

import "./Ownable.sol";


contract Alerter is Ownable {

  event BalanceDeposited(address from, uint value);
  event BalanceRefunded(address to, uint value);
  event SubscriptionCreated(address from, uint id, bytes info);
  event SubscriptionCancelled(address from, uint id);
  event AlertRecorded(uint alertTypeID, address from, bytes32 id);

  struct AlertType {
    bytes name;
    bool active;
    uint price;
  }

  struct Subscriber {
    bool[] subscriptions;
    uint activeSubscriptions;
    uint balance;
  }

  modifier onlyValidAlertType(uint id) {
    require(id < alertTypes.length);
    _;
  }

  AlertType[] public alertTypes;

  mapping(address => Subscriber) internal subscribers;

  function Alerter() public {
  }

  function () public payable {
    receiveFunds();
  }

  function addAlertType(bytes alertTypeID, uint price) public onlyOwner returns (uint) {
    AlertType memory atype = AlertType(alertTypeID, true, price);
    return alertTypes.push(atype);
  }

  function getAlertTypeName(uint alertTypeID) onlyValidAlertType(alertTypeID) view public returns (bytes) {
    return alertTypes[alertTypeID].name;
  }

  function getAlertTypeActive(uint alertTypeID) onlyValidAlertType(alertTypeID) view public returns (bool) {
    return alertTypes[alertTypeID].active;
  }

  function setAlertTypeActive(uint alertTypeID, bool active) onlyValidAlertType(alertTypeID) public onlyOwner {
    alertTypes[alertTypeID].active = active;
  }

  function getAlertTypePrice(uint alertTypeID) onlyValidAlertType(alertTypeID) view public returns (uint) {
    return alertTypes[alertTypeID].price;
  }

  function setAlertTypePrice(uint alertTypeID, uint price) onlyValidAlertType(alertTypeID) public onlyOwner {
    alertTypes[alertTypeID].price = price;
  }

  // Determine how many alerts of the given type can be sent with the current balance
  function getSubscriberAlertBalance(address subscriber, uint alertTypeID) onlyValidAlertType(alertTypeID) view public returns (uint) {
    return subscribers[subscriber].balance / alertTypes[alertTypeID].price;
  }

  // Fetch the current deposit balance
  function getSubscriberBalance(address subscriber) view public returns (uint) {
    return subscribers[subscriber].balance;
  }

  // Total number of subscriptions, active and inactive
  function getSubscriptionCount(address subscriber) view public returns (uint) {
    return subscribers[subscriber].subscriptions.length;
  }

  // Number of active subscriptions
  function getSubscriptionActiveCount(address subscriber) view public returns (uint) {
    return subscribers[subscriber].activeSubscriptions;
  }

  // Get whether a subscription is active
  function getSubscriptionActive(address subscriber, uint subscriptionID) view public returns (bool) {
    return subscribers[subscriber].subscriptions[subscriptionID];
  }

  // Claim a refund of the current deposit balance. Any subscriptions still active
  // will be paused until there is balance again.
  function refundSubscriberBalance() public {
    uint balance = subscribers[msg.sender].balance;
    require(balance > 0);
    subscribers[msg.sender].balance = 0;
    BalanceRefunded(msg.sender, balance);
    msg.sender.transfer(balance);
  }

  // Call this with the necessary (encrypted) metadata to log a subscription.
  // To reduce storage costs the actual subscription information is not stored
  // in contract, only in the log.
  function createSubscription(bytes info) public payable returns (uint) {
    // You can subscribe and make a deposit in a single call
    if (msg.value > 0) {
      receiveFunds();
    }
    // But whichever way you must have a balance to create a subscription
    require(getSubscriberBalance(msg.sender) > 0);
    uint subscriptionID = subscribers[msg.sender].subscriptions.length;
    subscribers[msg.sender].subscriptions.push(true);
    subscribers[msg.sender].activeSubscriptions++;
    SubscriptionCreated(msg.sender, subscriptionID, info);
    return subscriptionID;
  }

  // Called by the subscriber to cancel a subscription
  function cancelSubscription(uint subscriptionID) public {
    // Can only cancel an active subscription
    require(subscribers[msg.sender].subscriptions[subscriptionID]);
    subscribers[msg.sender].subscriptions[subscriptionID] = false;
    subscribers[msg.sender].activeSubscriptions--;
    SubscriptionCancelled(msg.sender, subscriptionID);
  }

  // Called by the alerter service to charge the subscriber for an alert that
  // has been sent.
  function recordAlert(uint alertTypeID, address subscriber, bytes32 id) public onlyValidAlertType(alertTypeID) onlyOwner {
    // Customer must have a balance
    require(subscribers[subscriber].balance >= alertTypes[alertTypeID].price);
    // Deduct fee from subscriber balance
    subscribers[subscriber].balance -= alertTypes[alertTypeID].price;
    AlertRecorded(alertTypeID, subscriber, id);
  }

  // Helper function which records subscriber deposits
  function receiveFunds() internal {
    subscribers[msg.sender].balance += msg.value;
    BalanceDeposited(msg.sender, msg.value);
  }
}
