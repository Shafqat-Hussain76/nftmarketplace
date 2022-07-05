// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./ERC721Token.sol";
import "hardhat/console.sol";

contract MarketPlace {
    event Sale(address indexed _msgsender, address indexed _contract, uint _tokenId);
    event Buy(address indexed _msgsender, address indexed _contract, uint _tokenId);
    MYERC721 nft;
    address payable owner;
    address payable rateGetter;
    uint itemCount;
    uint feerate;
    constructor(uint _feerate, MYERC721 _nft) {
        nft = MYERC721(_nft);
        rateGetter = payable(msg.sender);
        feerate = _feerate;
        owner = payable(msg.sender);
    }
    struct item {
        uint itemCount;
        uint price;
        uint tokenid;
        bool sold;
    }
    mapping(uint => item) private items;

    function additem(uint _tokenid, uint _price) external returns(uint) {
        itemCount++;
        items[itemCount] = item(itemCount, _price, _tokenid, false);
        nft.transferFrom(msg.sender, address(this), _tokenid);
        emit Sale(msg.sender, address(this), _tokenid);
        return itemCount;
    }
    function saleitem(uint _itemid) external payable {
        require(_itemid > 0 && _itemid <= itemCount, " Not valid");
        item storage sitem = items[_itemid];
        require(!sitem.sold, "The Token is already sold");
        uint amount = sitem.price * (100 + feerate) / 100;
        require(msg.value == amount, "not enogh money for purchase");
        owner.transfer(sitem.price);
        rateGetter.transfer(amount - sitem.price);
        sitem.sold = true;
        nft.transferFrom(address(this),msg.sender, sitem.tokenid);
        emit Buy(msg.sender, address(this), sitem.tokenid);
    }
}
