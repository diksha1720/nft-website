//SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract RockyInu is ERC721A, Ownable, ReentrancyGuard {
    using Strings for uint256;
    string private baseURI;

    // withdraw addresses
    address t1 = 0x3be84CBCaF171ea7562E1f2cAf21721c5E43F2C1; //to be updated
    address t2 = 0x453371298fFc7A95bCcc281719Cf49004fC7AE5f;

    uint64 public cost = 0.04 ether; // to be changed
    uint64 public maxSupply = 10000;
    uint256 public maxMintWhitelisted = 0;
    bool public paused = false;

    bool public normalSaleIsActive = false;
    bool public whitelistSaleIsActive = false;

    mapping(address => uint256) private _isWhiteListed;

    //Constructor
    constructor() ERC721A("Rocky Inu", "ROCKY") {
        //Owner gets one NFT assigned
        _safeMint(msg.sender, 1);
    }

    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
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
            _isWhiteListed[addresses[i]] = _numAllowedToMint;
        }
    }

    function mintNFT(uint256 _mintNum) public payable {
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
            _safeMint(msg.sender, _mintNum);
        } else if (whitelistSaleIsActive) {
            require(
                _isWhiteListed[msg.sender] != 0,
                "User not allowed to mint tokens"
            );
            require(
                balanceOf(msg.sender) + _mintNum <= _isWhiteListed[msg.sender],
                "Mint limit reached \n You cannot mint anymore tokenss"
            );
            _safeMint(msg.sender, _mintNum);
        }

        transferEth();
    }

    function giveAway(address _user, uint256 _mintNum) public onlyOwner {
        _safeMint(_user, _mintNum);
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
    }

    function transferEth() public payable {
        uint256 _t1pay = ((address(this).balance) * 25) / 100;
        uint256 _t2pay = ((address(this).balance) * 75) / 100;
        (bool success1, ) = payable(t1).call{value: _t1pay}("");
        (bool success2, ) = payable(t2).call{value: _t2pay}("");
        require(success2, "Failed to Send Ether");
        require(success1, "Failed to Send Ether");
    }

    fallback() external payable {}

    receive() external payable {}

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
}
