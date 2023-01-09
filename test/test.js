const { assert } = require('chai')
const { ethers } = require('hardhat')
const { expect } = require("chai");
const { BigNumber } = require('ethers');
describe('DolphinNFT Contract', async () => {
  let nft;
  let nftContractAddress;
  let tokenId;
  let owner;
  let addr1;
  let addr2;

  beforeEach('Setup Contract', async () => {
    const RandomNft = await ethers.getContractFactory("DolphinNFT");
    [owner, addr1, addr2] = await ethers.getSigners();
    const baseuri = `ipfs://${[process.env.METADATA_CID]}/`
    nft = await RandomNft.deploy(baseuri)
    await nft.deployed()
    nftContractAddress = await nft.address
  })

  it('Should have an address', async () => {
    assert.notEqual(nftContractAddress, 0x0)
    assert.notEqual(nftContractAddress, '')
    assert.notEqual(nftContractAddress, null)
    assert.notEqual(nftContractAddress, undefined)
  })
  it("total supply should be one initially", async () => {
    const total_supply = await nft.totalSupply();
    assert.equal(total_supply, 1)
    // console.log(await nft.balanceOf(addr1.address))
    await nft.connect(owner).createRandomNFT();
    const total_supply_after = await nft.totalSupply();
    assert.equal(total_supply_after, 2)

  })
  it("should set the right owner", async () => {
    const contractowner = await nft.owner()
    assert.equal(contractowner, owner.address)
    assert.notEqual(contractowner, addr1.address)
    console.log(contractowner)
  })

  it("should assign an nft to a different owner", async () => {
    await nft.connect(addr1).createRandomNFT({ value: ethers.utils.parseEther("0.03") });
    const noOfTokensaddr1 = await nft.balanceOf(addr1.address)
    assert.equal(noOfTokensaddr1, 1)
    const total_supply = await nft.totalSupply();
    assert.equal(total_supply, 2)
  })

  it("should not assign an nft to a different owner if not enough tokens are set ", async () => {
    await expect(nft.connect(addr1).createRandomNFT({ value: ethers.utils.parseEther("0.01") })).to.be.revertedWith("Not enough tokens")

    const noOfTokensaddr1 = await nft.balanceOf(addr1.address)
    assert.equal(noOfTokensaddr1, 0)
    const total_supply = await nft.totalSupply()
    assert.equal(total_supply, 1)
  })
  it("should revert back if maximum supply is reached", async () => {
    await nft.setMaxSupply(2)
    await nft.connect(addr1).createRandomNFT({ value: ethers.utils.parseEther("0.03") })



    assert.equal(await nft.totalSupply(), 2)
    await expect(nft.connect(addr2).createRandomNFT({ value: ethers.utils.parseEther("0.03") })).to.be.revertedWith("Supply limit reached")
  })

  // Only Owner Functions

  it("should set new cost when owner calls the function", async () => {
    await nft.setCost(BigNumber.from("50000000000000000"))//0.05
    expect(await nft.cost()).to.equal(BigNumber.from("50000000000000000"))
    console.log(await nft.cost())
  })
  it("should not set new cost when another user calls the function", async () => {
    await expect(nft.connect(addr1).setCost(BigNumber.from("50000000000000000"))).to.be.revertedWith("")
    expect(await nft.cost()).to.equal(BigNumber.from("30000000000000000"))
  })



})
