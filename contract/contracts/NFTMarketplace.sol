pragma solidity ^0.8.20;
// SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NFTMarketplace is ERC721URIStorage, ReentrancyGuard {
    uint256 private _tokenIds = 0;
    address payable marketplaceOwner;
    uint256 listPrice = 0.01 ether;

    struct PriceHistory {
        uint256 price;
        uint256 timestamp;
        address setter;
    }

    struct ListedToken {
        uint256 tokenId;
        address payable creator; // The creator of the NFT
        address payable owner; // The current owner of the NFT
        uint256 price; // The price of the NFT on the marketplace
        bool currentlyListed; // Is the NFT currently listed for sale
        uint256 priceHistoryLength;
        mapping(uint256 => PriceHistory) priceHistory;
    }

    struct InitialNFTData {
        address owner;
        string tokenURI;
        uint256 price;
        bool isListed;
        uint256 tokenID;
    }

    event TokenListedSuccess(
        uint256 indexed tokenId,
        address creator,
        address owner,
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

    event TokenListingUpdated(
        uint256 indexed tokenId,
        bool newListingStatus,
        address updatedBy,
        uint256 timestamp
    );

    event TokenSold(
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price,
        uint256 timestamp
    );

    event WithdrawalComplete(
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    mapping(uint256 => ListedToken) private idToListedToken;
    mapping(address => uint256) private pendingWithdrawals;

    constructor() ERC721("NFTMarketplace", "NFTify") {
        marketplaceOwner = payable(msg.sender);
    }

    function bulkInitializeNFTs(InitialNFTData[] calldata nfts) public {
        uint256 latestTokenID = _tokenIds;
        for (uint i = 0; i < nfts.length; i++) {
            require(nfts[i].owner != address(0), "Invalid owner address");
            require(bytes(nfts[i].tokenURI).length > 0, "Empty tokenURI");

            // Increment token ID
            uint256 newTokenId = nfts[i].tokenID;

            // Mint NFT
            _safeMint(nfts[i].owner, newTokenId);
            _setTokenURI(newTokenId, nfts[i].tokenURI);

            // Create listing
            ListedToken storage newToken = idToListedToken[newTokenId];
            newToken.tokenId = nfts[i].tokenID;
            newToken.creator = payable(nfts[i].owner);
            newToken.owner = payable(nfts[i].owner);
            newToken.price = nfts[i].price;
            newToken.currentlyListed = nfts[i].isListed;

            // Add initial price to history
            newToken.priceHistory[0] = PriceHistory({
                price: nfts[i].price,
                timestamp: block.timestamp,
                setter: nfts[i].owner
            });
            newToken.priceHistoryLength = 1;

            emit TokenListedSuccess(
                newTokenId,
                nfts[i].owner,
                nfts[i].owner,
                nfts[i].price,
                nfts[i].isListed
            );

            latestTokenID = newTokenId;
        }

        _tokenIds = latestTokenID + 1;
    }

    function getListPrice() public view returns (uint256) {
        return listPrice;
    }

    function updateListPrice(uint256 newPrice) public {
        require(
            msg.sender == marketplaceOwner,
            "Only owner can update the list price"
        );
        listPrice = newPrice;
    }

    function getLatestIdToListedToken()
        public
        view
        returns (
            uint256 tokenId,
            address tokenOwner,
            address tokenSeller,
            uint256 price,
            bool currentlyListed
        )
    {
        uint256 currentTokenId = _tokenIds - 1;
        ListedToken storage token = idToListedToken[currentTokenId];

        return (
            token.tokenId,
            token.creator,
            token.owner,
            token.price,
            token.currentlyListed
        );
    }

    // Other functions remain mostly the same, but be cautious with structs containing mappings
    function getListedTokenForId(
        uint256 tokenId
    )
        public
        view
        returns (
            uint256 tokenId_,
            address creator_,
            address owner_,
            uint256 price_,
            bool currentlyListed_
        )
    {
        ListedToken storage token = idToListedToken[tokenId];
        return (
            token.tokenId,
            token.creator,
            token.owner,
            token.price,
            token.currentlyListed
        );
    }

    function getCurrentToken() public view returns (uint256) {
        return _tokenIds - 1;
    }

    function createToken(
        string memory tokenURI,
        uint256 price,
        bool currentlyListed
    ) public payable returns (uint) {
        uint256 newTokenId = _tokenIds;
        _tokenIds += 1;

        _safeMint(msg.sender, newTokenId);

        _setTokenURI(newTokenId, tokenURI);

        createListedToken(newTokenId, price, currentlyListed);

        return newTokenId;
    }

    function createListedToken(
        uint256 tokenId,
        uint256 price,
        bool currentlyListed
    ) private {
        require(msg.value == listPrice, "Hopefully sending the correct price");
        require(price >= 0, "Price must be greater or equal to 0");

        ListedToken storage token = idToListedToken[tokenId];
        token.tokenId = tokenId;
        token.creator = payable(msg.sender);
        token.owner = payable(msg.sender);
        token.price = price;
        token.currentlyListed = currentlyListed;

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
            msg.sender,
            msg.sender,
            price,
            currentlyListed
        );
    }

    function getAllNFTs()
        public
        view
        returns (
            uint256[] memory tokenIds,
            string[] memory tokenURIs,
            address[] memory creators,
            address[] memory owners,
            uint256[] memory prices,
            bool[] memory currentlyListeds
        )
    {
        // Count valid tokens first
        uint validTokens = 0;
        for (uint i = 1; i <= _tokenIds; i++) {
            if (idToListedToken[i].tokenId != 0) {
                validTokens++;
            }
        }

        // Initialize arrays with correct size
        tokenIds = new uint256[](validTokens);
        tokenURIs = new string[](validTokens);
        creators = new address[](validTokens);
        owners = new address[](validTokens);
        prices = new uint256[](validTokens);
        currentlyListeds = new bool[](validTokens);

        // Fill arrays with valid token data
        uint currentIndex = 0;
        for (uint i = 1; i <= _tokenIds; i++) {
            if (idToListedToken[i].tokenId != 0) {
                ListedToken storage token = idToListedToken[i];
                tokenIds[currentIndex] = token.tokenId;
                tokenURIs[currentIndex] = tokenURI(token.tokenId);
                creators[currentIndex] = token.creator;
                owners[currentIndex] = token.owner;
                prices[currentIndex] = token.price;
                currentlyListeds[currentIndex] = token.currentlyListed;
                currentIndex++;
            }
        }

        return (
            tokenIds,
            tokenURIs,
            creators,
            owners,
            prices,
            currentlyListeds
        );
    }

    function getMyNFTs()
        public
        view
        returns (
            uint256[] memory tokenIds,
            address[] memory creators,
            address[] memory owners,
            uint256[] memory prices,
            bool[] memory currentlyListeds
        )
    {
        uint totalItemCount = _tokenIds;
        uint itemCount = 0;

        // First pass: count matching items
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToListedToken[i].owner == msg.sender) {
                itemCount++;
            }
        }

        // Prepare arrays
        tokenIds = new uint256[](itemCount);
        creators = new address[](itemCount);
        owners = new address[](itemCount);
        prices = new uint256[](itemCount);
        currentlyListeds = new bool[](itemCount);

        uint currentIndex = 0;

        // Second pass: populate arrays
        for (uint i = 0; i < totalItemCount; i++) {
            ListedToken storage token = idToListedToken[i];
            if (token.owner == msg.sender) {
                tokenIds[currentIndex] = token.tokenId;
                creators[currentIndex] = token.owner;
                owners[currentIndex] = token.owner;
                prices[currentIndex] = token.price;
                currentlyListeds[currentIndex] = token.currentlyListed;
                currentIndex++;
            }
        }

        return (tokenIds, creators, owners, prices, currentlyListeds);
    }

    function executeSale(uint256 tokenId) public payable nonReentrant {
        ListedToken storage token = idToListedToken[tokenId];
        uint price = token.price;
        address payable seller = idToListedToken[tokenId].owner;

        require(token.currentlyListed, "Token is not listed for sale");
        require(msg.value == price, "Incorrect price");
        require(msg.sender != seller, "Cannot buy your own token");

        // console log
        console.log("Owner balance before sale: %s", address(seller).balance);
        console.log(
            "Buyer balance before sale: %s",
            address(msg.sender).balance
        );
        console.log(
            "Marketplace balance before sale: %s",
            address(this).balance
        );

        // Update token state after purchase
        token.currentlyListed = false;
        token.owner = payable(msg.sender);

        uint256 marketplaceCut = listPrice;
        uint256 sellerProceeds = msg.value - listPrice;

        marketplaceOwner.transfer(marketplaceCut);
        seller.transfer(sellerProceeds);

        _transfer(seller, msg.sender, tokenId);

        token.priceHistory[token.priceHistoryLength] = PriceHistory({
            price: price,
            timestamp: block.timestamp,
            setter: msg.sender
        });
        token.priceHistoryLength++;

        // pendingWithdrawals[seller] += sellerProceeds;

        // console log
        console.log("Owner balance after sale: %s", address(seller).balance);
        console.log(
            "Buyer balance after sale: %s",
            address(msg.sender).balance
        );
        console.log(
            "Marketplace balance after sale: %s",
            address(this).balance
        );

        emit TokenSold(tokenId, seller, msg.sender, price, block.timestamp);
    }

    function withdraw() public {
        uint256 amount = pendingWithdrawals[msg.sender]; // Get the amount to withdraw
        require(amount > 0, "No funds to withdraw");

        pendingWithdrawals[msg.sender] = 0; // Reset the pending amount
        payable(msg.sender).transfer(amount); // Send the amount to the sender

        emit WithdrawalComplete(msg.sender, amount, block.timestamp);
    }

    function updateTokenPrice(uint256 tokenId, uint256 newPrice) public {
        require(
            idToListedToken[tokenId].owner == msg.sender,
            "Only the seller can update the price"
        );
        require(newPrice >= 0, "Price must be greater or equal to 0");

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

    function updateTokenListing(uint256 tokenId, bool newListingStatus) public {
        require(
            idToListedToken[tokenId].owner == msg.sender,
            "Only the seller can update the listing status"
        );

        ListedToken storage token = idToListedToken[tokenId];
        token.currentlyListed = newListingStatus;

        emit TokenListingUpdated(
            tokenId,
            newListingStatus,
            msg.sender,
            block.timestamp
        );
    }

    function getTokenPriceHistory(
        uint256 tokenId
    ) public view returns (PriceHistory[] memory) {
        ListedToken storage token = idToListedToken[tokenId];
        PriceHistory[] memory history = new PriceHistory[](
            token.priceHistoryLength
        );

        for (uint256 i = 0; i < token.priceHistoryLength; i++) {
            history[i] = token.priceHistory[i];
        }

        return history;
    }
}
