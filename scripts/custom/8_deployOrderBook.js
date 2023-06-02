const { deployContract, sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const {readFileSync, writeFileSync } = require("fs");
const outputFilePath = "./scripts/custom/deployments.json";

async function main() {

  const deployments = JSON.parse(readFileSync(outputFilePath, "utf-8"));
  const orderBook = await deployContract("OrderBook", []);
  deployments["orderBook"] = orderBook.address;

  await sendTxn(orderBook.initialize(
    deployments.router,//"0x5F719c2F1095F7B9fc68a68e35B51194f4b6abe8", // router
    deployments.vault,//"0x9ab2De34A33fB459b538c43f251eB825645e8595", // vault
    deployments.WETH,//nativeToken.address, // weth
    deployments.USDG,//"0xc0253c3cC6aa5Ab407b5795a04c28fB063273894", // usdg
    "10000000000000000", // 0.01 AVAX
    expandDecimals(10, 30) // min purchase token amount usd
  ), "orderBook.initialize");

  writeFileSync(outputFilePath, JSON.stringify(deployments, null, 2));
  console.log("Completed");
  
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
