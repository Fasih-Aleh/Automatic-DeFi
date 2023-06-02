require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-contract-sizer")
require('@typechain/hardhat')

const {
  POLYGON_MUMBAI_URL,
  POLYGON_MUMBAI_DEPLOY_KEY,
  POLYGONSCAN_API_KEY,
  ARBITRUM_GOERLI_URL,
  ARBITRUM_GOERLI_DEPLOY_KEY,
  ARBISCAN_API_KEY
} = require("./env.json")

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners()

  for (const account of accounts) {
    console.info(account.address)
  }
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "arbitrumGoerli",
  networks: {
    localhost: {
      timeout: 120000
    },
    hardhat: {
      allowUnlimitedContractSize: true
    },
    polygonMumbai: {
      url: POLYGON_MUMBAI_URL,
      chainId: 80001,
      accounts: [POLYGON_MUMBAI_DEPLOY_KEY]
    },
    arbitrumGoerli: {
      url: ARBITRUM_GOERLI_URL,
      chainId: 421613,
      accounts: [ARBITRUM_GOERLI_DEPLOY_KEY]
    }
  },
  etherscan: {
    apiKey: {
      polygonMumbai: POLYGONSCAN_API_KEY,
      arbitrumGoerli: ARBISCAN_API_KEY
    },
    customChains: [
      {
        network: "arbitrumGoerli",
        chainId: 421613,
        urls: {
          apiURL: "https://goerli.arbiscan.io/api",
          browserURL: "https://goerli.arbiscan.io/"
        }
      }
    ]
  },
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10
      }
    }
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
}
