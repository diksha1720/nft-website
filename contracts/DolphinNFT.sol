//SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DolphinNFT is ERC721Enumerable, Ownable {
    using Strings for uint256;
    string private baseURI;

    bool public revealed = false;
    uint64 public cost = 0.01 ether;
    uint64 public maxSupply = 20;
    uint256 public maxMintWhitelisted = 0;
    bool public paused = false;

    bool public normalSaleIsActive = false;
    bool public whitelistSaleIsActive = false;

    mapping(address => uint256[]) private _ownerTokens;
    mapping(address => uint256) private _isWhiteListed;

    //Constructor
    constructor(string memory _initBaseURI) ERC721("Check Dolphin", "DNFT2") {
        setBaseURI(_initBaseURI);
        //Owner gets one NFT assigned
        _safeMint(msg.sender, 1);
    }

    // internal
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function setWhiteList(
        address[] calldata addresses,
        uint256 _numAllowedToMint
    ) external onlyOwner {
        maxMintWhitelisted = _numAllowedToMint;
        for (uint256 i = 0; i < addresses.length; i++) {
            _isWhiteListed[addresses[i]] = _numAllowedToMint + 1;
        }
    }

    function createRandomNFT(uint256 _mintNum) public payable {
        uint256 supply = totalSupply();
        require(
            whitelistSaleIsActive || normalSaleIsActive,
            "not ready for sale"
        );
        require(!paused, "Another Transaction in Progress");
        require(supply + _mintNum <= maxSupply, "Supply Limit Reached");
        if (msg.sender != owner()) {
            //general public
            require(msg.value >= cost * _mintNum, "Not Enough Tokens");
        } else {
            cost = 0;
        }

        if (normalSaleIsActive) {
            for (uint256 i = 1; i <= _mintNum; i++) {
                //tokenId = supply+i
                _safeMint(msg.sender, supply + i);
                _ownerTokens[msg.sender].push(supply + i);
            }
        } else if (whitelistSaleIsActive) {
            // when user is either not in whitelist or has exhausted his quota
            // require(
            //     _isWhiteListed[msg.sender] != 1,
            //     "User not allowed to mint anymore tokens"
            // );
            require(
                _isWhiteListed[msg.sender] != 0,
                "User not allowed to mint tokens"
            );
            require(
                _isWhiteListed[msg.sender] != 1,
                "Mint limit reached \n You cannot mint anymore tokenss"
            );
            require(
                _isWhiteListed[msg.sender] >= _mintNum,
                "Mint limit exceeded for the user"
            );
            for (uint256 i = 1; i <= _mintNum; i++) {
                //tokenId = supply+i
                _safeMint(msg.sender, supply + i);
                _ownerTokens[msg.sender].push(supply + i);
            }
            _isWhiteListed[msg.sender] -= _mintNum;
        }
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(_exists(tokenId), "Non Existent Token");
        string memory currentBaseURI = _baseURI();
        if (revealed) {
            return (
                bytes(currentBaseURI).length > 0
                    ? string(
                        abi.encodePacked(
                            currentBaseURI,
                            tokenId.toString(),
                            ".json"
                        )
                    )
                    : ""
            );
        } else {
            return
                bytes(currentBaseURI).length > 0
                    ? string(abi.encodePacked(currentBaseURI, "Hidden.json"))
                    : "";
        }
    }

    function withdrawAll() public onlyOwner {
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(success, "Failed to Send Ether");
    }

    function tokensOwnedBy(address _userAddress)
        public
        view
        returns (uint256[] memory)
    {
        return _ownerTokens[_userAddress];
    }

    //only owner
    function setCost(uint64 _newCost) public onlyOwner {
        cost = _newCost;
    }

    function setMaxSupply(uint64 _maxSupply) public onlyOwner {
        maxSupply = _maxSupply;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function pause(bool _state) public onlyOwner {
        paused = _state;
    }

    function setNormalSale(bool _state) public onlyOwner {
        normalSaleIsActive = _state;
    }

    function setWhiteListSale(bool _state) public onlyOwner {
        whitelistSaleIsActive = _state;
    }

    function setmaxMintWhitelisted(uint128 _num) public onlyOwner {
        maxMintWhitelisted = _num;
    }

    function setRevealed(bool _state) public onlyOwner {
        revealed = _state;
    }
}
