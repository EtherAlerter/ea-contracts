pragma solidity ^0.4.19;

import "./Ownable.sol";


contract Alerter is Ownable {

  event BalanceDeposited(address from, uint value);
  event BalanceRefunded(address to, uint value);
  event SubscriptionCreated(address from, bytes32 id, bytes info);
  event SubscriptionCancelled(address from, bytes32 id);
  event AlertRecorded(uint alertTypeID, address from, bytes32 id);

  struct AlertType {
    bytes name;
    bool active;
    uint price;
  }

  modifier onlyValidAlertType(uint id) {
    require(id < alertTypes.length);
    _;
  }

  AlertType[] public alertTypes;

  // Available balance
  mapping(address => uint) internal alertBalances;

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
  function getAlertBalance(uint alertTypeID, address holder) onlyValidAlertType(alertTypeID) view public returns (uint) {
    return alertBalances[holder] / alertTypes[alertTypeID].price;
  }

  // Determine the current deposit balance
  function getDepositBalance(address holder) view public returns (uint) {
    return alertBalances[holder];
  }

  // Claim a refund of the current deposit balance.
  function refundDepositBalance() public {
    uint balance = alertBalances[msg.sender];
    require(balance > 0);
    alertBalances[msg.sender] = 0;
    BalanceRefunded(msg.sender, balance);
    msg.sender.transfer(balance);
  }

  function createSubscription(bytes info) public payable returns (bytes32) {
    // You can subscribe and make a deposit in a single call
    if (msg.value > 0) {
      receiveFunds();
    }
    // But whichever way you must have a balance to create a subscription
    require(getDepositBalance(msg.sender) > 0);
    bytes32 subscriptionID = keccak256(msg.data, block.number);
    SubscriptionCreated(msg.sender, subscriptionID, info);
    return subscriptionID;
  }

  function cancelSubscription(bytes32 subscriptionID) public {
    SubscriptionCancelled(msg.sender, subscriptionID);
  }

  function recordAlert(uint alertTypeID, address customer, bytes32 id) public onlyValidAlertType(alertTypeID) onlyOwner {
    require(alertBalances[customer] >= alertTypes[alertTypeID].price);
    alertBalances[customer] -= alertTypes[alertTypeID].price;
    AlertRecorded(alertTypeID, customer, id);
  }

  function receiveFunds() internal {
    alertBalances[msg.sender] += msg.value;
    BalanceDeposited(msg.sender, msg.value);
  }
}
