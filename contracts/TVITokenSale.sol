pragma solidity ^0.4.2;
import "./TVIToken.sol";


contract TVITokenSale {
    address admin;
    TVIToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    function TVITokenSale(TVIToken _tokenContract, uint256 _tokenPrice) public{
        admin = msg.sender;
       //assign on admin
        tokenContract = _tokenContract;
       //token contract
        tokenPrice = _tokenPrice;
        //token price
    }
    //multiply function
   function multiply(uint x, uint y) internal pure returns(uint z){
      require(y == 0 || (z = x * y) / y == x);
   }



    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        require(tokenContract.balanceOf(this) >= _numberOfTokens);
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        tokensSold += _numberOfTokens;

        Sell(msg.sender, _numberOfTokens);
    }
    //Ending token Sale
    function endSale() public {
        require(msg.sender == admin);
        require(tokenContract.transfer(admin, tokenContract.balanceOf(this)));

        selfdestruct(admin);
    }

}
