const { deployContract, sendTxn } = require("../shared/helpers");
const {readFileSync, writeFileSync } = require("fs");
const outputFilePath = "./scripts/custom/deployments.json";

async function main() {
  const deployments = JSON.parse(readFileSync(outputFilePath, "utf-8"));
  
  const keeper = await deployContract("PositionKeeper", [deployments.positionRouter], "PositionKeeper")
  deployments["keeper"] = keeper.address;

  writeFileSync(outputFilePath, JSON.stringify(deployments, null, 2));
  console.log("Completed");

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
