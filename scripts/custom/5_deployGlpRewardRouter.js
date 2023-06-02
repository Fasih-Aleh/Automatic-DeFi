const { deployContract, sendTxn } = require("../shared/helpers")
const {readFileSync, writeFileSync } = require("fs");
const outputFilePath = "./scripts/custom/deployments.json";

async function main() {
  const deployments = JSON.parse(readFileSync(outputFilePath, "utf-8"));
  
  const AddressZero = deployments.ZERO;
  
  const rewardRouter = await deployContract("RewardRouterV2", [])
  deployments["glpRewardRouter"] = rewardRouter.address;

  await sendTxn(rewardRouter.initialize(
    deployments.WETH,
    AddressZero, // _gmx
    AddressZero, // _esGmx
    AddressZero, // _bnGmx
    deployments.GLP, // _glp
    AddressZero, // _stakedGmxTracker
    AddressZero, // _bonusGmxTracker
    AddressZero, // _feeGmxTracker
    deployments.fGLP, // _feeGlpTracker
    deployments.fsGLP, // _stakedGlpTracker
    deployments.glpManager, // _glpManager
    AddressZero, // _gmxVester
    AddressZero // glpVester
  ), "rewardRouter.initialize")

  writeFileSync(outputFilePath, JSON.stringify(deployments, null, 2));
  console.log("Completed");
  
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
