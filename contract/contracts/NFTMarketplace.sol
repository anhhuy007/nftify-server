pragma solidity ^0.8.20;
// SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTMarketplace is ERC721URIStorage {
    uint256 private _tokenIds = 0;
    uint256 private _itemSolds = 0;
    address payable marketplaceOwner;
    uint256 listPrice = 0.01 ether;

    struct PriceHistory {
        uint256 price;
        uint256 timestamp;
        address setter;
    }

    struct ListedToken {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool currentlyListed;
        uint256 priceHistoryLength;
        mapping(uint256 => PriceHistory) priceHistory;
    } 

    event TokenListedSuccess(
        uint256 indexed tokenId, 
        address owner,
        address seller,
        uint256 price,
        bool currentlyListed
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
        marketplaceOwner = payable(msg.sender);
    }

    function getListPrice() public view returns (uint256) {
        return listPrice;
    }

    function updateListPrice(uint256 newPrice) public {
        require(msg.sender == marketplaceOwner, "Only owner can update the list price");
        listPrice = newPrice;
    }

    function getLatestIdToListedToken() public view returns (
        uint256 tokenId, 
        address tokenOwner, 
        address tokenSeller, 
        uint256 price, 
        bool currentlyListed
    ) {
        uint256 currentTokenId = _tokenIds - 1;
        ListedToken storage token = idToListedToken[currentTokenId];

        return (
            token.tokenId,
            token.owner,
            token.seller,
            token.price,
            token.currentlyListed
        );
    }

     // Other functions remain mostly the same, but be cautious with structs containing mappings
    function getListedTokenForId(uint256 tokenId) public view returns (
        uint256 tokenId_, 
        address owner_, 
        address seller_, 
        uint256 price_, 
        bool currentlyListed_
    ) {
        ListedToken storage token = idToListedToken[tokenId];
        return (
            token.tokenId,
            token.owner,
            token.seller,
            token.price,
            token.currentlyListed
        );
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

        return newTokenId;
    }

    function createListedToken(uint256 tokenId, uint256 price) private {
        require(msg.value == listPrice, "Hopefully sending the correct price");
        require(price > 0, "Price must be greater than 0");

        ListedToken storage token = idToListedToken[tokenId];
        token.tokenId = tokenId;
        token.owner = payable(address(this));
        token.seller = payable(msg.sender);
        token.price = price;
        token.currentlyListed = true;
        
        // Add first price history entry
        token.priceHistory[token.priceHistoryLength] = PriceHistory({
            price: price,
            timestamp: block.timestamp,
            setter: msg.sender
        });
        token.priceHistoryLength++;

        _transfer(msg.sender, address(this), tokenId);  

        emit TokenListedSuccess(
            tokenId, 
            address(this), 
            msg.sender, 
            price, 
            true
        );
    }

    function getAllNFTs() public view returns (
        uint256[] memory tokenIds, 
        address[] memory owners, 
        address[] memory sellers, 
        uint256[] memory prices, 
        bool[] memory currentlyListeds
    ) {
        tokenIds = new uint256[](_tokenIds);
        owners = new address[](_tokenIds);
        sellers = new address[](_tokenIds);
        prices = new uint256[](_tokenIds);
        currentlyListeds = new bool[](_tokenIds);

        for (uint i = 0; i < _tokenIds; i++) {
            ListedToken storage token = idToListedToken[i];
            tokenIds[i] = token.tokenId;
            owners[i] = token.owner;
            sellers[i] = token.seller;
            prices[i] = token.price;
            currentlyListeds[i] = token.currentlyListed;
        }

        return (tokenIds, owners, sellers, prices, currentlyListeds);
    }

    function getMyNFTs() public view returns (
        uint256[] memory tokenIds, 
        address[] memory owners, 
        address[] memory sellers, 
        uint256[] memory prices, 
        bool[] memory currentlyListeds
    ) {
        uint totalItemCount = _tokenIds;
        uint itemCount = 0;
        
        // First pass: count matching items
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToListedToken[i].owner == msg.sender || idToListedToken[i].seller == msg.sender) {
                itemCount++;
            }
        }

        // Prepare arrays
        tokenIds = new uint256[](itemCount);
        owners = new address[](itemCount);
        sellers = new address[](itemCount);
        prices = new uint256[](itemCount);
        currentlyListeds = new bool[](itemCount);
        
        uint currentIndex = 0;
        
        // Second pass: populate arrays
        for (uint i = 0; i < totalItemCount; i++) {
            ListedToken storage token = idToListedToken[i];
            if (token.owner == msg.sender || token.seller == msg.sender) {
                tokenIds[currentIndex] = token.tokenId;
                owners[currentIndex] = token.owner;
                sellers[currentIndex] = token.seller;
                prices[currentIndex] = token.price;
                currentlyListeds[currentIndex] = token.currentlyListed;
                currentIndex++;
            }
        }

        return (tokenIds, owners, sellers, prices, currentlyListeds);
    }

    function excuteSale(uint256 tokenId) public payable {
        ListedToken storage token = idToListedToken[tokenId];
        uint price = token.price;
        address seller = idToListedToken[tokenId].seller;
        
        require(token.currentlyListed, "Token is not currently listed for sale");
        require(msg.value == price, "Please submit the asking price in order to complete the sale");

        token.currentlyListed = false;
        token.price = 0;
        token.seller = payable(msg.sender);
        _itemSolds += 1;

        _transfer(address(this), msg.sender, tokenId);
        approve(address(this), tokenId);

        payable(marketplaceOwner).transfer(listPrice);
        payable(seller).transfer(msg.value);

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

        // Add new price history entry
        token.priceHistory[token.priceHistoryLength] = PriceHistory({
            price: newPrice, 
            timestamp: block.timestamp, 
            setter: msg.sender
        });
        token.priceHistoryLength++;

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
        ListedToken storage token = idToListedToken[tokenId];
        PriceHistory[] memory history = new PriceHistory[](token.priceHistoryLength);
        
        for (uint256 i = 0; i < token.priceHistoryLength; i++) {
            history[i] = token.priceHistory[i];
        }
        
        return history;
    }
}