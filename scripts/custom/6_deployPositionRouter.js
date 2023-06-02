const { deployContract, contractAt , sendTxn } = require("../shared/helpers")
const {readFileSync, writeFileSync } = require("fs");
const outputFilePath = "./scripts/custom/deployments.json";

async function main() {
  const deployments = JSON.parse(readFileSync(outputFilePath, "utf-8"));
  
  //const timelock = await contractAt("Timelock", await vault.gov(), signer)
  //const shortsTrackerTimelock = await contractAt("ShortsTrackerTimelock", "0xf58eEc83Ba28ddd79390B9e90C4d3EbfF1d434da", signer)

  const positionUtils = await deployContract("PositionUtils", [])
  deployments["positionUtils"] = positionUtils.address;

  const referralStorage = await deployContract("ReferralStorage", [])
  deployments["referralStorage"] = referralStorage.address;

  const router = await contractAt("Router", deployments.router)
  
  const vault = await contractAt("Vault", deployments.vault);

  const depositFee = "30" // 0.3%
  
  const minExecutionFee = "20000000000000000" // 0.02 AVAX

  //const referralStorageGov = await contractAt("Timelock", await referralStorage.gov(), signer)

  const positionRouterArgs = [vault.address, router.address, deployments.WETH, deployments.shortsTracker, depositFee, minExecutionFee]
  
  const positionRouter = await deployContract("PositionRouter", positionRouterArgs, "PositionRouter", {
      libraries: {
        PositionUtils: positionUtils.address
      }
  })
  deployments["positionRouter"] = positionRouter.address;

  await sendTxn(positionRouter.setReferralStorage(referralStorage.address), "positionRouter.setReferralStorage")
  
  //await sendTxn(referralStorageGov.signalSetHandler(referralStorage.address, positionRouter.address, true), "referralStorage.signalSetHandler(positionRouter)")

  //await sendTxn(shortsTrackerTimelock.signalSetHandler(positionRouter.address, "0x0000000000000000000000000000000000000000", true), "shortsTrackerTimelock.signalSetHandler(positionRouter)")

  await sendTxn(router.addPlugin(positionRouter.address), "router.addPlugin")

  await sendTxn(positionRouter.setDelayValues(0, 180, 30 * 60), "positionRouter.setDelayValues")
  
  //await sendTxn(timelock.setContractHandler(positionRouter.address, true), "timelock.setContractHandler(positionRouter)")

  await sendTxn(positionRouter.setGov(await vault.gov()), "positionRouter.setGov")
  await sendTxn(positionRouter.setAdmin(await vault.gov()), "positionRouter.setAdmin")

  writeFileSync(outputFilePath, JSON.stringify(deployments, null, 2));
  console.log("Completed");
  
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
