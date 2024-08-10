const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  INITIAL_SUPPLY,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FyToken Unit Test", function () {
      let fyToken, deployer, user1;

      beforeEach(async function () {
        const accounts = await getNamedAccounts();
        deployer = accounts.deployer;
        user1 = accounts.user1;

        console.log(user1);

        await deployments.fixture("all"); // 确保所有部署脚本已经运行
        fyToken = await ethers.getContract("FyToken", deployer); // 直接获取合约实例
      });

      it("应该正确部署", async () => {
        console.log("FyToken Address:", fyToken.getAddress()); // 调试输出
        assert(fyToken.getAddress());
      });

      describe("构造函数", () => {
        it("应该具有正确的初始供应量", async () => {
          const totalSupply = await fyToken.totalSupply();
          assert.equal(totalSupply.toString(), INITIAL_SUPPLY);
        });

        it("应该使用正确的名称和符号初始化代币", async () => {
          const name = await fyToken.name();
          assert.equal(name, "Free");

          const symbol = await fyToken.symbol();
          assert.equal(symbol, "FY");
        });
      });

      describe("转账", () => {
        it("应该能够成功转账代币到指定地址", async () => {
          const tokensToSend = "10000000000000000000"; // 10 个代币，单位为 wei (18 位小数)
          await fyToken.transfer(user1, tokensToSend);
          expect(await fyToken.balanceOf(user1)).to.equal(tokensToSend);
        });

        it("在转账发生时应该发出Transfer事件", async () => {
          const tokensToSend = "10000000000000000000"; // 10 个代币，单位为 wei (18 位小数)
          await expect(fyToken.transfer(user1, tokensToSend)).to.emit(
            fyToken,
            "Transfer"
          );
        });
      });

      describe("允许 (allowances)", () => {
        const amount = "20000000000000000000"; // 20 个代币，单位为 wei (18 位小数)
        beforeEach(async () => {
          playerToken = await ethers.getContract("FyToken", user1); // 直接获取合约实例
        });
        it("应该批准其他地址消费代币", async () => {
          const tokensToSpend = "5000000000000000000"; // 5 个代币，单位为 wei (18 位小数)
          await fyToken.approve(user1, tokensToSpend);
          await playerToken.transferFrom(deployer, user1, tokensToSpend);
          expect(await playerToken.balanceOf(user1)).to.equal(tokensToSpend);
        });
        it("不允许未经批准的账户进行转账", async () => {
          await expect(playerToken.transferFrom(deployer, user1, amount)).to.be
            .reverted;
        });
        it("在批准发生时应该发出Approval事件", async () => {
          await expect(fyToken.approve(user1, amount)).to.emit(
            fyToken,
            "Approval"
          );
        });
        it("设置的允许金额应该准确", async () => {
          await fyToken.approve(user1, amount);
          const allowance = await fyToken.allowance(deployer, user1);
          assert.equal(allowance.toString(), amount);
        });
        it("不允许用户超过批准限额", async () => {
          await fyToken.approve(user1, amount);
          await expect(
            playerToken.transferFrom(deployer, user1, "40000000000000000000")
          ).to.be.reverted; // 40 个代币
        });
      });
    });
