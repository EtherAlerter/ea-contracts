pragma solidity ^0.4.19;

import './Ownable.sol';

contract Alerter is Ownable {

  struct AlertType {
    bytes name;
    bool active;
    uint price;
  }

  AlertType[] public alertTypes;

  function Alerter() public {
  }

  function addAlertType(bytes id, uint price) public onlyOwner returns (uint) {
    AlertType memory atype = AlertType(id, true, price);
    return alertTypes.push(atype);
  }

  function getAlertTypeName(uint id) view public returns (bytes) {
    return alertTypes[id].name;
  }

  function getAlertTypeActive(uint id) view public returns (bool) {
    return alertTypes[id].active;
  }

  function getAlertTypePrice(uint id) view public returns (uint) {
    return alertTypes[id].price;
  }
}
