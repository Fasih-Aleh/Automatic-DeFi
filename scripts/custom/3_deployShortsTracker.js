const {readFileSync, writeFileSync } = require("fs");
const { deployContract, contractAt, sendTxn} = require("../shared/helpers");
const outputFilePath = "./scripts/custom/deployments.json";

async function main() {
  const deployments = JSON.parse(readFileSync(outputFilePath, "utf-8"));
  
  const vault = await contractAt("Vault", deployments.vault);
  
  const shortsTracker = await deployContract("ShortsTracker", [vault.address]);
  deployments["shortsTracker"] = shortsTracker.address;
  
  await sendTxn(shortsTracker.setGov(vault.gov()), "shortsTracker.setGov");
  
  const glpManager = await contractAt("GlpManager", deployments.glpManager);
  
  await sendTxn(glpManager.setShortsTracker(shortsTracker.address), "glpManager.setShortsTracker");
  
  writeFileSync(outputFilePath, JSON.stringify(deployments, null, 2));
  console.log("Completed");
  
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
