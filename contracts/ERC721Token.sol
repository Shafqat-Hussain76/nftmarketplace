// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MYERC721 is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenCount;
    constructor() ERC721("MYERC721", "MET"){

    }
    function mint(string calldata _tokenURI) external returns(uint) {
        _tokenCount.increment();
        uint tokenId = _tokenCount.current();
        _mint(_msgSender(), tokenId);
        _setTokenURI(tokenId, _tokenURI);
        return tokenId;
    }
}