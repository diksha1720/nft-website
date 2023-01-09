require('dotenv').config()
const main = async () => {
  const nftContractFactory = await ethers.getContractFactory('RockyInu')
  // const baseuri = `https://ipfs.io/ipfs/${[process.env.METADATA_CID]}/`
  // console.log(baseuri)
  const nftContract = await nftContractFactory.deploy()

  await nftContract.deployed()
  console.log('Contract deployed to:', nftContract.address())


}

// const main = async () => {
//   const nftContractFactory = await ethers.getContractFactory("DolphinContract");

//   const nftContract = await nftContractFactory.deploy()

//   await nftContract.deployed()
//   console.log('Contract deployed to:', nftContract.address)
//   console.log('Verify with : npx hardhat verify --network polygonMumbai ' + nftContract.address)

// }

const runMain = async () => {
  try {
    await main()
    process.exit(0)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

runMain()