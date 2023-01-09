// SPDX-License-Identifier: NONE
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract DolphinContract is ERC721Enumerable, Ownable {
    using Strings for uint256;
    using SafeMath for uint256;
    string private baseURI =
        "ipfs://Qmbth5C2oUb5Y12Z7b38YPWqSeiz7bhYMKuF6Vbamcq3uz/";
    address _DolphinContractAddress;
    uint256 public gen0MintLimit = 20; // Only 20 Dolphins can be created from scratch (generation 0)
    uint256 public gen0amountTotal;
    uint256 public breedCost = 0.001 ether;
    uint256 public genCost = 0.002 ether;
    bool public paused = false;

    // this struct is the blueprint for new NFTs
    struct CryptoDolphin {
        string name;
        uint256 parent1Id;
        uint256 parent2Id;
        uint256 generation;
        uint256 genes;
        uint256 birthtime;
    }

    // This is an array that holds all CryptoDolphin NFTs accessed by their tokenIDs
    CryptoDolphin[] public allDolphinsArray;

    // Creation event, emitted after successful NFT creation with these parameters
    event DolphinCreated(
        address owner,
        uint256 tokenId,
        uint256 parent1Id,
        uint256 parent2Id,
        uint256 genes
    );

    // Breeding event, combining two owned NFTs can create a third, new one
    event BreedingSuccessful(
        uint256 tokenId,
        uint256 genes,
        uint256 birthtime,
        uint256 parent1Id,
        uint256 parent2Id,
        uint256 generation,
        address owner
    );

    constructor() ERC721("Crypto Dolphins", "DNFT") {
        _DolphinContractAddress = address(this);
        _createDolphin(0, 0, 0, 1214131177989271, _msgSender()); // minting a placeholder Zero Dolphin NFT, that occupies Token ID 0 and later burning it
        _burn(0);
    }

    // used for creating generation 0 Dolphins
    function createGen0Dolphin(uint256 _genes) public payable {
        require(!paused, "Transaction paused");
        require(
            gen0amountTotal < gen0MintLimit,
            "Maximum amount of gen 0 Dolphins reached"
        );
        if (msg.sender != owner()) {
            require(msg.value >= genCost, "Insufficient Funds");
        }
        gen0amountTotal++;

        _createDolphin(0, 0, 0, _genes, _msgSender());
    }

    // Function to mint demo Dolphin NFTs with hardcoded generation 99
    function createDemoDolphin(uint256 _genes, address _userAddress)
        public
        payable
        returns (uint256)
    {
        require(!paused, "Transaction paused");
        if (msg.sender != owner()) {
            require(msg.value >= genCost, "Insufficient funds.");
        }

        uint256 newDolphin = _createDolphin(99, 99, 99, _genes, _userAddress);
        return newDolphin;
    }

    // used for creating new Dolphin NFTs
    function _createDolphin(
        uint256 _parent1Id,
        uint256 _parent2Id,
        uint256 _generation,
        uint256 _genes,
        address _owner
    ) private returns (uint256) {
        CryptoDolphin memory newDolphin = CryptoDolphin({
            name: "Crypto Dolphin",
            parent1Id: uint256(_parent1Id),
            parent2Id: uint256(_parent2Id),
            generation: uint256(_generation),
            genes: _genes,
            birthtime: uint256(block.timestamp)
        });

        allDolphinsArray.push(newDolphin);
        uint256 newDolphinId = allDolphinsArray.length.sub(1); // getting the array length-1 and saving that as the new Token ID, starting with 0
        _safeMint(_owner, newDolphinId);

        emit DolphinCreated(
            _owner,
            newDolphinId,
            _parent1Id,
            _parent2Id,
            _genes
        );
        return newDolphinId;
    }

    // breeding functionality, combining two owned NFTs creates a new third one
    function breed(uint256 _parent1Id, uint256 _parent2Id)
        public
        payable
        returns (uint256)
    {
        require(!paused, "Transaction paused");

        if (msg.sender != owner()) {
            require(msg.value >= breedCost, "Insufficient funds.");
        }

        // _msgSender() needs to be owner of both crypto Dolphins
        require(
            ownerOf(_parent1Id) == _msgSender() &&
                ownerOf(_parent2Id) == _msgSender(),
            "DolphinContract: Must be owner of both parent tokens"
        );

        // calculating new DNA string from two NFT parents' genes
        uint256 _parent1genes = allDolphinsArray[_parent1Id].genes;
        uint256 _parent2genes = allDolphinsArray[_parent2Id].genes;
        uint256 _newDna = _mixDna(_parent1genes, _parent2genes);

        // calculates generation
        uint256 _newGeneration = _calcGeneration(_parent1Id, _parent2Id);
        uint256 newDolphinId = _createDolphin(
            _parent1Id,
            _parent2Id,
            _newGeneration,
            _newDna,
            _msgSender()
        );

        emit BreedingSuccessful(
            newDolphinId,
            allDolphinsArray[newDolphinId].genes,
            allDolphinsArray[newDolphinId].birthtime,
            allDolphinsArray[newDolphinId].parent1Id,
            allDolphinsArray[newDolphinId].parent2Id,
            allDolphinsArray[newDolphinId].generation,
            _msgSender()
        );

        _burn(_parent1Id);
        _burn(_parent2Id);

        return newDolphinId;
    }

    function _getRandom() internal view returns (uint8) {
        return uint8(block.timestamp % 255);
    }

    // will generate a pseudo random number and from that decide whether to take a two-digit pair of genes from _parent1genes or _parent2genes, repeated for 7 pairs (8th pair is pseudoRandomAdv, put in front)
    function _mixDna(uint256 _parent1genes, uint256 _parent2genes)
        internal
        view
        returns (uint256)
    {
        uint256[8] memory _geneArray;
        uint8 _random = uint8(_getRandom());
        // index position for 2 digits during 7 loops, _geneArray[7]-_geneArray[1]
        uint256 countdown = 7;

        // Bitshift: move to next binary bit, 7 loops
        for (uint256 i = 1; i <= 64; i = i * 2) {
            // Then add 2 last digits from the dna to the new dna
            if (_random & i != 0) {
                _geneArray[countdown] = uint8(_parent1genes % 100);
            } else {
                _geneArray[countdown] = uint8(_parent2genes % 100);
            }
            //each loop, take off the last 2 digits from the genes number string
            _parent1genes = _parent1genes / 100;
            _parent2genes = _parent2genes / 100;

            countdown = countdown.sub(1);
        }

        // creating a pseudo random number and including them in the new DNA, so that it has some unique elements
        uint256 pseudoRandomAdv = uint256(
            keccak256(
                abi.encodePacked(
                    uint256(_random),
                    totalSupply(),
                    allDolphinsArray[0].genes
                )
            )
        );
        // makes this number a 2 digit number between 10-98 (largest result of %89 is 88)
        pseudoRandomAdv = (pseudoRandomAdv % 89) + 10;
        // setting first 2 digits in DNA string to this new 2 digit number
        _geneArray[0] = pseudoRandomAdv;
        uint256 newGeneSequence;

        // puts in last positioned array entry (2 digits) as first numbers, then adds 00, then adds again,
        // therefore reversing the backwards information in the array again to correct order
        for (uint256 j = 0; j < 8; j++) {
            newGeneSequence = newGeneSequence + _geneArray[j];

            // will stop adding zeros after last repetition
            if (j != 7) {
                newGeneSequence = newGeneSequence * 100;
            }
        }

        return newGeneSequence;
    }

    // calculates generation of newly bred NFTs
    function _calcGeneration(uint256 _parent1Id, uint256 _parent2Id)
        internal
        view
        returns (uint256)
    {
        uint256 _generationOfParent1 = allDolphinsArray[_parent1Id].generation;
        uint256 _generationOfParent2 = allDolphinsArray[_parent2Id].generation;

        require(
            _generationOfParent1 < 1000 && _generationOfParent2 < 1000,
            "Parents cannot breed above gen999"
        );

        // if both parents have same gen, child will be parents' gen+1

        // if they have different gen, new gen is average of parents gen plus 2
        // for ex. 1 + 5 = 6, 6/2 = 3, 3+2 = 5, newGeneration would be 5

        // rounding numbers down if odd:
        // for ex. 1+2=3, 3*10 = 30, 30/2 = 15
        // 15 % 10 = 5, 5>0, 15-5=10
        // 10 / 10 = 1, 1+2 = 3
        // newGeneration = 3

        uint256 newGeneration;

        if (_generationOfParent1 != _generationOfParent2) {
            uint256 _roundingNumbers = (((_generationOfParent1 +
                _generationOfParent2) * 10) / 2);
            if (_roundingNumbers % 10 > 0) {
                _roundingNumbers - 5;
            }
            newGeneration = (_roundingNumbers / 10) + 2;
        } else {
            newGeneration =
                ((_generationOfParent1 + _generationOfParent2) / 2) +
                1;
        }

        return newGeneration;
    }

    // function to get the tokenURI of the NFT based on the tokenID provided
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

    // internal function to get the current baseURI within the contract
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    // function to get the current contract address
    function getDolphinContractAddress() public view returns (address) {
        return _DolphinContractAddress;
    }

    // returns an array with the NFT Token IDs that the provided sender address owns
    function findDolphinIdsOfAddress(address owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256 amountOwned = balanceOf(owner);
        uint256[] memory ownedTokenIDs = new uint256[](amountOwned);

        for (
            uint256 indexToCheck = 0;
            indexToCheck < amountOwned;
            indexToCheck++
        ) {
            uint256 foundNFT = tokenOfOwnerByIndex(owner, indexToCheck);
            ownedTokenIDs[indexToCheck] = foundNFT;
        }

        return ownedTokenIDs;
    }

    // getting details of Dolphin NFT based on tokenID provided
    function getDolphinDetails(uint256 tokenId)
        public
        view
        returns (
            string memory name,
            uint256 genes,
            uint256 birthtime,
            uint256 parent1Id,
            uint256 parent2Id,
            uint256 generation,
            address owner
        )
    {
        require(_exists(tokenId), "Non Existent Token");
        return (
            allDolphinsArray[tokenId].name,
            allDolphinsArray[tokenId].genes,
            allDolphinsArray[tokenId].birthtime,
            allDolphinsArray[tokenId].parent1Id,
            allDolphinsArray[tokenId].parent2Id,
            allDolphinsArray[tokenId].generation,
            ownerOf(tokenId)
        );
    }

    // function to pause the minting only by the owner
    function setPaused(bool _state) public onlyOwner {
        paused = _state;
    }

    // setting a new baseURI only by owner
    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    // setting the cost required to mint new NFTs
    function setGenCost(uint256 _cost) public onlyOwner {
        genCost = _cost;
    }

    // setting the cost required to breed two NFTs
    function setBreedCost(uint256 _cost) public onlyOwner {
        breedCost = _cost;
    }

    // setting the max number of generation 0 NFTs that can be minted
    function setGen0MintLimit(uint256 _num) public onlyOwner {
        gen0MintLimit = _num;
    }

    // function for owner to withdraw any ETH that has accumulated in this contract
    function withdrawETH() public onlyOwner {
        address payable receiver = payable(_msgSender());
        receiver.transfer(_DolphinContractAddress.balance);
    }
}
