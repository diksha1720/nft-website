require("@nomiclabs/hardhat-waffle");
require('dotenv').config()
require('hardhat-contract-sizer');
require("@nomiclabs/hardhat-etherscan");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
  networks: {
    hardhat: {
      gasLimit: 205000
    },
    rinkeby: {
      gasLimit: 205000,
      url: process.env.ALCHEMY_RINKEBY_URL,
      accounts: [process.env.ACCOUNT_KEY],
    },
    polygonMumbai: {
      gasLimit: 205000,
      url: process.env.POLYGON_MUMBAI_URL,
      accounts: [process.env.ACCOUNT_KEY],
    },
    polygonMainnet: {
      gasLimit: 205000,
      url: process.env.POLYGON_MAINNET_URL,
      accounts: [process.env.ACCOUNT_KEY],
    },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API
  },
};

