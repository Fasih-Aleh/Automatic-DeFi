const { deployContract, contractAt , sendTxn } = require("../shared/helpers")
const {readFileSync, writeFileSync } = require("fs");
const outputFilePath = "./scripts/custom/deployments.json";

async function main() {
  const deployments = JSON.parse(readFileSync(outputFilePath, "utf-8"));

  const vault = await contractAt("Vault", deployments.vault)
  const timelock = await contractAt("Timelock", await vault.gov())
  const router = await contractAt("Router", await vault.router())
  const shortsTracker = await contractAt("ShortsTracker", deployments.shortsTracker)
  const weth = await contractAt("WETH", deployments.WETH);
  const orderBook = await contractAt("OrderBook", deployments.orderBook)
  const referralStorage = await contractAt("ReferralStorage", deployments.referralStorage)
  const positionUtils = await contractAt("PositionUtils", deployments.positionUtils)
  const depositFee = 30 // 0.3%
  const orderKeepers = []
  const liquidators = []
  const partnerContracts = []

  console.log("Deploying new position manager")
  const positionManagerArgs = [vault.address, router.address, shortsTracker.address, weth.address, depositFee, orderBook.address]
  const positionManager = await deployContract("PositionManager", positionManagerArgs, "PositionManager", {
    libraries: {
      PositionUtils: positionUtils.address
    }
  })
  deployments["positionManager"] = positionManager.address;
  
  // positionManager only reads from referralStorage so it does not need to be set as a handler of referralStorage
  if ((await positionManager.referralStorage()).toLowerCase() != referralStorage.address.toLowerCase()) {
    await sendTxn(positionManager.setReferralStorage(referralStorage.address), "positionManager.setReferralStorage")
  }
  if (await positionManager.shouldValidateIncreaseOrder()) {
    await sendTxn(positionManager.setShouldValidateIncreaseOrder(false), "positionManager.setShouldValidateIncreaseOrder(false)")
  }

  for (let i = 0; i < orderKeepers.length; i++) {
    const orderKeeper = orderKeepers[i]
    if (!(await positionManager.isOrderKeeper(orderKeeper.address))) {
      await sendTxn(positionManager.setOrderKeeper(orderKeeper.address, true), "positionManager.setOrderKeeper(orderKeeper)")
    }
  }

  for (let i = 0; i < liquidators.length; i++) {
    const liquidator = liquidators[i]
    if (!(await positionManager.isLiquidator(liquidator.address))) {
      await sendTxn(positionManager.setLiquidator(liquidator.address, true), "positionManager.setLiquidator(liquidator)")
    }
  }

  // if (!(await timelock.isHandler(positionManager.address))) {
  //   await sendTxn(timelock.setContractHandler(positionManager.address, true), "timelock.setContractHandler(positionManager)")
  // }
  // if (!(await vault.isLiquidator(positionManager.address))) {
  //   await sendTxn(timelock.setLiquidator(vault.address, positionManager.address, true), "timelock.setLiquidator(vault, positionManager, true)")
  // }
  if (!(await shortsTracker.isHandler(positionManager.address))) {
    await sendTxn(shortsTracker.setHandler(positionManager.address, true), "shortsTracker.setContractHandler(positionManager.address, true)")
  }
  if (!(await router.plugins(positionManager.address))) {
    await sendTxn(router.addPlugin(positionManager.address), "router.addPlugin(positionManager)")
  }

  for (let i = 0; i < partnerContracts.length; i++) {
    const partnerContract = partnerContracts[i]
    if (!(await positionManager.isPartner(partnerContract))) {
      await sendTxn(positionManager.setPartner(partnerContract, true), "positionManager.setPartner(partnerContract)")
    }
  }

  if ((await positionManager.gov()) != (await vault.gov())) {
    await sendTxn(positionManager.setGov(await vault.gov()), "positionManager.setGov")
  }

  writeFileSync(outputFilePath, JSON.stringify(deployments, null, 2));
  console.log("Completed");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
