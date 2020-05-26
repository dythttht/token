pragma solidity >=0.4.21 <0.7.0;
pragma experimental ABIEncoderV2;

import "../app/node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";

contract SimpleExchange {

  ERC721Full public token;

  mapping(uint => uint) orderBook;

  mapping (bytes32 => uint) rindex;

  struct TransRecord {
    string hasher;
    uint tokenId;
    address from;
    address to;
    uint price;
  }

  mapping (uint => TransRecord) transrecords;

  event TokenListed(
    uint indexed _tokenId,
    uint indexed _price
  );

  event TokenSold(
    uint indexed _tokenId,
    uint indexed _price
  );

  constructor(address _tokenAddress) public {
    token = ERC721Full(_tokenAddress);
  }

  function listToken(uint _tokenId, uint _price) public {
    address owner = token.ownerOf(_tokenId);
    require(owner == msg.sender);
    require(token.isApprovedForAll(owner, address(this)));
    orderBook[_tokenId] = _price;
    emit TokenListed(_tokenId, _price);
  }

  function validBuyOrder(uint _tokenId, uint _askPrice) private view returns (bool) {
    require(orderBook[_tokenId] > 0);
    return (_askPrice >= orderBook[_tokenId]);
  }

  function markTokenAsSold(uint _tokenId) private {
    orderBook[_tokenId] = 0;
  }

  function listingPrice(uint _tokenId) public view returns (uint) {
    return orderBook[_tokenId];
  }

  function buyToken(uint _tokenId) public payable {
    require(validBuyOrder(_tokenId, msg.value));
    address owner = token.ownerOf(_tokenId);
    address payable ownerPayable = address(uint160(owner));
    ownerPayable.transfer(msg.value);
    token.safeTransferFrom(owner, msg.sender, _tokenId);
    markTokenAsSold(_tokenId);
    rindex['record']++;
    transrecords[rindex['record']] = TransRecord('', _tokenId, owner, msg.sender, msg.value);
    emit TokenSold(_tokenId, msg.value);
  }

  function given(uint _tokenId, address _reciver) public {
    address owner = token.ownerOf(_tokenId);
    require(owner == msg.sender);
    token.safeTransferFrom(owner, _reciver, _tokenId);
  }

  function record(string memory _hasher) public {
    transrecords[rindex['record']].hasher = _hasher;
  }

  function getRecord(uint i) public view returns (TransRecord memory) {
    return transrecords[i];
  }

  function getRecordNum() public view returns (uint) {
    return rindex['record'];
  }
}
