const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const INITIAL_SUPPLY = "365000000000000000000"; // 365 FY tokens (18 decimals)

  console.log("Deploying FyToken...");

  const FyToken = await deploy("FyToken", {
    from: deployer,
    args: [INITIAL_SUPPLY],
    log: true,
  });

  console.log(`FyToken deployed at ${FyToken.address}`);
  if (network.name !== "hardhat" && network.name !== "localhost") {
    await verify(FyToken.address, [INITIAL_SUPPLY]);
  }
};

module.exports.tags = ["all"];
