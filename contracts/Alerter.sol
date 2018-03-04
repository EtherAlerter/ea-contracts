pragma solidity ^0.4.19;

import "./Ownable.sol";


contract Alerter is Ownable {

  event BalanceDeposited(address from, uint value);
  event BalanceRefunded(address to, uint value);
  event SubscriptionCreated(address from, bytes32 id, bytes info);
  event SubscriptionCancelled(address from, bytes32 id);

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

  function addAlertType(bytes id, uint price) public onlyOwner returns (uint) {
    AlertType memory atype = AlertType(id, true, price);
    return alertTypes.push(atype);
  }

  function getAlertTypeName(uint id) onlyValidAlertType(id) view public returns (bytes) {
    return alertTypes[id].name;
  }

  function getAlertTypeActive(uint id) onlyValidAlertType(id) view public returns (bool) {
    return alertTypes[id].active;
  }

  function setAlertTypeActive(uint id, bool active) onlyValidAlertType(id) public onlyOwner {
    alertTypes[id].active = active;
  }

  function getAlertTypePrice(uint id) onlyValidAlertType(id) view public returns (uint) {
    return alertTypes[id].price;
  }

  function setAlertTypePrice(uint id, uint price) onlyValidAlertType(id) public onlyOwner {
    alertTypes[id].price = price;
  }

  // Determine how many alerts of the given type can be sent with the current balance
  function getAlertBalance(uint id, address holder) onlyValidAlertType(id) view public returns (uint) {
    return alertBalances[holder] / alertTypes[id].price;
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
    bytes32 id = keccak256(msg.data, block.number);
    SubscriptionCreated(msg.sender, id, info);
    return id;
  }

  function cancelSubscription(bytes32 id) public {
    SubscriptionCancelled(msg.sender, id);
  }

  function receiveFunds() internal {
    alertBalances[msg.sender] += msg.value;
    BalanceDeposited(msg.sender, msg.value);
  }
}
