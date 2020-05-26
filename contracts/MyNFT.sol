pragma solidity >=0.4.21 <0.7.0;

import '../app/node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol';
import '../app/node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol';

contract MyNFT is ERC721Full, ERC721Mintable {
  constructor() ERC721Full("MyNFT", "MNFT") public {}

  function setTokenURI(uint256 tokenId,string memory uri) public {
    _setTokenURI(tokenId,uri);
  }
}
