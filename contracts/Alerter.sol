pragma solidity ^0.4.19;

import "./Ownable.sol";


contract Alerter is Ownable {

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

  function Alerter() public {
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

  function getTokenBalance(uint id, address holder) onlyValidAlertType(id) view public returns (uint) {
    // TODO: IMPL
    require(holder != 0); // defeat unused variable check
    return 1;
  }

  function buyTokens(uint id) onlyValidAlertType(id) public payable returns (uint) {
    require(msg.value >= alertTypes[id].price);
    uint256 tokens = msg.value / alertTypes[id].price;
    // TODO: add tokens to map
    return tokens;
  }
}
