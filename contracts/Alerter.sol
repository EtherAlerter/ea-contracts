pragma solidity ^0.4.19;

import "./Ownable.sol";


contract Alerter is Ownable {

  event BalanceDeposited(address from, uint value);
  event BalanceRefunded(address to, uint value);

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
  mapping(address => uint) public alertBalances;

  function Alerter() public {
  }

  function () public payable {
    alertBalances[msg.sender] += msg.value;
    BalanceDeposited(msg.sender, msg.value);
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
}
