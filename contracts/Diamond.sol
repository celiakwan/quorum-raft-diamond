// SPDX-License-Identifier: MIT
pragma solidity ^0.5.17;

import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract Diamond is ERC721Full {
    using SafeMath for uint256;

    mapping(string => bool) private _diamondMinted;
    Metadata[] private _metadata;

    struct Metadata {
        string carat;
        string shape;
        string cut;
        string clarity;
        string color;
    }

    constructor() ERC721Full("Diamond", "DMD") public {
    }

    event DiamondMinted(uint256 tokenId, string registrationNumber, string url, address owner);

    modifier mintable(string memory _registrationNumber) {
        require(!_diamondMinted[_registrationNumber], "mintable: already minted");
        _;
    }

    function mint(
        string memory _registrationNumber,
        string memory _carat,
        string memory _shape,
        string memory _cut,
        string memory _clarity,
        string memory _color,
        string memory _url,
        address _owner
    ) public mintable(_registrationNumber) {
        Metadata memory m = Metadata(
            _carat,
            _shape,
            _cut,
            _clarity,
            _color
        );
        
        uint256 tokenId = _metadata.push(m).sub(1);
        _mint(msg.sender, tokenId);
        _diamondMinted[_registrationNumber] = true;
        
        emit DiamondMinted(tokenId, _registrationNumber, _url, _owner);
    }

    function getMetadata(uint256 tokenId) public view returns (
        string memory carat,
        string memory shape,
        string memory cut,
        string memory clarity,
        string memory color
    ) {
        Metadata memory m = _metadata[tokenId];
        return (
            m.carat,
            m.shape,
            m.cut,
            m.clarity,
            m.color
        );
    }
}