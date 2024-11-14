// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter = 0;

    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender) {}

    function safeMint(
        address receiver,
        string memory uri
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        
        // safe mint
        _safeMint(receiver, tokenId);
    
        // safe NFT URI
        _setTokenURI(tokenId, uri);

        // increase the token id counter
        _tokenIdCounter++;

        emit Transfer(address(0), receiver, tokenId);

        return tokenId;
    }

    function transferWithPayment(
        address sender,
        address receiver,
        uint256 tokenId,
        uint256 price
    ) public payable {
        // check for ownership
        require(ownerOf(tokenId) == sender, "Sender doesn't own this NFT");

        // check for insufficient payment
        require(msg.value >= price, "Insufficient payment sent");

        // transfer payment to owner
        payable(sender).transfer(msg.value);

        // transfer payment to owner
        safeTransferFrom(sender, receiver, tokenId);

        // emit the transfer event
        emit Transfer(sender, receiver, tokenId);
    }
}