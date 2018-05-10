pragma solidity ^0.4.2;

contract TVIToken {
    //Constructor
    //Set the total numbers of fokens
    //Read tokens
    uint256 public totalSupply;
    //name
    string public name = "TVIToken";
    //symbol
    string public symbol = "TVIT";
    //standard
    string public standard = "TVI Token v.3.3";



    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );
    event Approval (
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );


    mapping(address => uint256) public balanceOf;
    //allowance
    mapping(address => mapping(address => uint256))public allowance;


    function TVIToken (uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
        //allocate initial supply;
    }
      //Transfer
     //Return boolean
      //Transfer event

    function transfer (address _to, uint256 _value) public returns(bool success) {
          //Exception if account is not enough
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        Transfer(msg.sender, _to, _value);
        return true;
      }
    //Delegated transfer
    //approve

    function approve(address _spender, uint256 _value) public returns(bool success) {
        //Allowance
        allowance[msg.sender][_spender] = _value;
        //Approve event
        Approval(msg.sender, _spender, _value);
        return true;
    }

    //transfer From
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
        require(_value <= balanceOf[_from]);
        //requerement that from account has enough tokens
        require(_value <= allowance[_from][msg.sender]);
        //require is big enough
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        //update allowance
        Transfer(_from, _to, _value);
        return true;
    }

}
