pragma solidity ^0.4.18;

contract Ownable {
	// state variable
	address owner;

	// modifiers
	modifier onlyOwner() {
		require(msg.sender == owner);
		_; // rest of the calling function
	}

	function Ownable() public {
		owner = msg.sender;
	}
}