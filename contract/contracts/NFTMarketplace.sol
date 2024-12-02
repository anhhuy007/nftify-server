pragma solidity ^0.8.20;
// SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTMarketplace is ERC721URIStorage {
    uint256 private _tokenIds = 0;
    uint256 private _itemSolds = 0;
    address payable owner;
    uint256 listPrice = 0.01 ether;

    // the structure to store the price history of a token
    struct PriceHistory {
        uint256 price;
        uint256 timestamp;
        address setter;
    }

    // the structure to store the listed token (NFT)
    struct ListedToken {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool currentlyListed;
        PriceHistory[] priceHistory;
    } 

    // the event to emit when a token is successfully listed
    event TokenListedSuccess(
        uint256 indexed tokenId, 
        address owner,
        address seller,
        uint256 price,
        bool currentlyListed,
    );

    event TokenPriceUpdated(
        uint256 indexed tokenId,
        uint256 oldPrice, 
        uint256 newPrice,
        address updatedBy, 
        uint256 timestamp
    );

    mapping(uint256 => ListedToken) private idToListedToken;

    constructor() ERC721("NFTMarketplace", "NFTify") {
        owner = payable(msg.sender);
    }

    function getListPrice() public view returns (uint256) {
        return listPrice;
    }

    // only the owner can update the list price (royalty - marketplace fee)
    function updateListPrice(uint256 newPrice) public {
        require(msg.sender == owner, "Only owner can update the list price");
        listPrice = newPrice;
    }

    function getLatestIdToListedToken() public view returns (ListedToken memory) {
        uint256 currentTokenId = _tokenIds - 1;
        return idToListedToken[currentTokenId];
    }

    function getListedTokenForId(uint256 tokenId) public view returns (ListedToken memory) {
        return idToListedToken[tokenId];
    }

    function getCurrentToken() public view returns (uint256) {
        return _tokenIds - 1;
    }

    function createToken(
        string memory tokenURI, 
        uint256 price
    ) public payable returns (uint) {
        uint256 newTokenId = _tokenIds;
        _tokenIds += 1;
        
        _safeMint(msg.sender, newTokenId);

        _setTokenURI(newTokenId, tokenURI);

        createListedToken(newTokenId, price);

        idToListedToken[newTokenId].priceHistory.push(PriceHistory(
            price: price, 
            timestamp: block.timestamp, 
            setter: msg.sender
        ));

        return newTokenId;
    }

    // the first time a token is created, it is minted and listed
    function createListedToken(uint256 tokenId, uint256 price) private {
        // make sure the sender sent enough ETH to pay for listing
        require(msg.value == listPrice, "Hopefully sending the correct price");

        // sanity check
        require(price > 0, "Price must be greater than 0");

        // update the mapping of tokenId's to token details
        idToListedToken[tokenId] = ListedToken(
            tokenId, 
            payable(address(this)), 
            payable(msg.sender),
            price, 
            true
        );

        _transfer(msg.sender, address(this), tokenId);  

        // emit the event
        emit TokenListedSuccess(
            tokenId, 
            address(this), 
            msg.sender, 
            price, 
            true
        );
    }

    function getAllNFTs() public view returns (ListedToken[] memory) {
        uint nftCount = _tokenIds;
        ListedToken[] memory nfts = new ListedToken[](nftCount);
        uint currentIndex = 0;
        uint currentId; 

        for (uint i = 0; i < nftCount; i++) {
            currentId = i;
            ListedToken storage currentItem = idToListedToken[currentId];
            nfts[currentIndex] = currentItem;
            currentIndex++;
        }

        return nfts; 
    }

    function getMyNFTs() public view returns (ListedToken[] memory) {
        uint totalItemCount = _tokenIds;
        uint itemCount = 0;
        uint currentIndex = 0;
        uint currentId;

        for (uint i = 0; i < totalItemCount; i++) {
            if (idToListedToken[i].owner == msg.sender || idToListedToken[i].seller == msg.sender) {
                itemCount++;
            }
        }

        ListedToken[] memory items = new ListedToken[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToListedToken[i].owner == msg.sender || idToListedToken[i].seller == msg.sender) {
                currentId = i;
                ListedToken storage currentItem = idToListedToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }

        return items;
    }

    function excuteSale(uint256 tokenId) public payable {
        ListedToken storage token = idToListedToken[tokenId];
        uint price = token.price;
        address seller = idToListedToken[tokenId].seller;
        
        require(token.currentlyListed, "Token is not currently listed for sale");
        require(msg.value == price, "Please submit the asking price in order to complete the sale");

        // update the details of token
        token.currentlyListed = false; // no longer listed
        token.price = 0; // no longer has a price
        token.seller = payable(msg.sender);
        _itemSolds += 1;

        // actually transfer the NFT to new owner
        _transfer(address(this), msg.sender, tokenId);
        approve(address(this), tokenId);

        // transfer the funds
        payable(owner).transfer(listPrice);
        payable(seller).transfer(msg.value);

        // emit the event
        emit TokenListedSuccess(
            tokenId, 
            address(this), 
            msg.sender, 
            price, 
            false
        );
    }

    function updateTokenPrice(uint256 tokenId, uint256 newPrice) public {
        require(idToListedToken[tokenId].seller == msg.sender, "Only the seller can update the price");
        require(newPrice > 0, "Price must be greater than 0");

        ListedToken storage token = idToListedToken[tokenId];
        uint256 oldPrice = token.price;

        token.priceHistory.push(PriceHistory(
            price: newPrice, 
            timestamp: block.timestamp, 
            setter: msg.sender
        ));

        token.price = newPrice;

        emit TokenPriceUpdated(
            tokenId, 
            oldPrice, 
            newPrice, 
            msg.sender, 
            block.timestamp
        );
    }

    function getTokenPriceHistory(uint256 tokenId) public view returns (PriceHistory[] memory) {
        return idToListedToken[tokenId].priceHistory;
    }
}