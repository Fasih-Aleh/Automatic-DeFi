const { deployContract, sendTxn } = require("../shared/helpers");
const {readFileSync, writeFileSync } = require("fs");
const outputFilePath = "./scripts/custom/deployments.json";

async function main() {
  const deployments = JSON.parse(readFileSync(outputFilePath, "utf-8"));
  
  const reader = await deployContract("Reader", [], "Reader")
  deployments["reader"] = reader.address;

  const rewardReader = await deployContract("RewardReader", [], "RewardReader")
  deployments["rewardReader"] = rewardReader.address;

  const orderBookReader = await deployContract("OrderBookReader", [])
  deployments["orderBookReader"] = orderBookReader.address;

  await sendTxn(reader.setConfig(true), "Reader.setConfig")
  
  writeFileSync(outputFilePath, JSON.stringify(deployments, null, 2));
  console.log("Completed");

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
