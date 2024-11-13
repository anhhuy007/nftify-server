// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyNFT is ERC721URIStorage {
    uint256 private _tokenIdCounter;

    constructor() ERC721("MyNFT", "MNFT") {}

    function safeMint(address receiver, string memory uri) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _safeMint(receiver, tokenId);
        _setTokenURI(tokenId, uri);
        _tokenIdCounter += 1;
        return tokenId;
    }

    // function safeTransferFrom(address from, address to, uint256 tokenId) public virtual override(ERC721, IERC721) {
    //     super.safeTransferFrom(from, to, tokenId);
    // }
}