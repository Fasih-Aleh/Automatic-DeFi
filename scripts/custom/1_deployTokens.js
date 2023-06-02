const {readFileSync, writeFileSync } = require("fs");
const { deployContract, callWithRetries } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const outputFilePath = "./scripts/custom/deployments.json";

async function main() {

  const deployments = JSON.parse(readFileSync(outputFilePath, "utf-8"));
  
  deployments["ZERO"] = "0x0000000000000000000000000000000000000000";
  
  const WETH = await callWithRetries(deployContract, ["WETH", ["Wrapped Ether", "WETH", 18]]);
  deployments["WETH"] = WETH.address;
  
  const WBTC = await callWithRetries(deployContract, ["FaucetToken", ["Wrapped Bitcoin", "WBTC", 18, expandDecimals(1000, 18)]]);
  deployments["WBTC"] = WBTC.address;
  
  const USDC = await callWithRetries(deployContract, ["FaucetToken", ["USDC Coin", "USDC", 18, expandDecimals(1000, 18)]]);
  deployments["USDC"] = USDC.address;
  
  const USDT = (await callWithRetries(deployContract, ["FaucetToken", ["Tether", "USDT", 18, expandDecimals(1000, 18)]]));
  deployments["USDT"] = USDT.address;
  
  const GMX = await callWithRetries(deployContract, ["GMX", []]);
  deployments["GMX"] = GMX.address;
  
  const esGMX = await callWithRetries(deployContract, ["MintableBaseToken", ["esGMX", "esGMX", 0]]);
  deployments["esGMX"] = esGMX.address;
    
  writeFileSync(outputFilePath, JSON.stringify(deployments, null, 2));
  console.log("Completed");
  
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })