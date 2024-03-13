import {
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress } from "viem";

describe("Test Token", function () {
    async function deployTokenFixture() {
        const [owner, addr1, addr2] = await hre.viem.getWalletClients();
        const contract = await hre.viem.deployContract("TestToken" as never, [
            "1000000000",
        ]);
        return {
            contract,
            owner,
            addr1,
            addr2,
        };
    }

    describe("Deployment", function () {
        it("Deployment should assign the total supply of tokens to the owner", async () => {
            const { contract, owner } = await loadFixture(deployTokenFixture);
            const ownerAddress = getAddress(owner.account.address);
            const ownerBalance = await contract.read.balanceOf([ownerAddress]);
            expect(await contract.read.totalSupply()).to.equal(ownerBalance);
        });

        it("Check if token name is TestToken", async () => {
            const { contract } = await loadFixture(deployTokenFixture);
            expect(await contract.read.name()).to.equal("TestToken");
        });

        it("Check if symbol is TST", async () => {
            const { contract } = await loadFixture(deployTokenFixture);
            expect(await contract.read.symbol()).to.equal("TST");
        });

        it("Check decimals is 18", async () => {
            const { contract } = await loadFixture(deployTokenFixture);
            expect(await contract.read.decimals()).to.equal(18);
        });

        it("Check if total supply is 1000000000 * 10 ^ 18", async () => {
            const amount = "1000000000000000000000000000";
            const { contract } = await loadFixture(deployTokenFixture);
            expect(await contract.read.totalSupply()).to.equal(BigInt(amount));
        });

        it("Check if user thats doesnot have balance cannot do transfer", async () => {
            const { contract, addr1, addr2 } = await loadFixture(
                deployTokenFixture
            );
            const tokenAsAddr1 = await hre.viem.getContractAt(
                "TestToken",
                contract.address,
                { walletClient: addr1 }
            );
            await expect(
                tokenAsAddr1.write.transfer([addr2.account.address, BigInt(1)])
            ).to.be.rejectedWith("Insufficient balance");
        });

        it("Check if error is thrown if token sent to null address", async () => {
            const nullAddress = "0x0000000000000000000000000000000000000000";
            const { contract, addr1 } = await loadFixture(deployTokenFixture);
            const tokenAsAddr1 = await hre.viem.getContractAt(
                "TestToken",
                contract.address,
                { walletClient: addr1 }
            );
            await expect(
                tokenAsAddr1.write.transfer([nullAddress, BigInt(1)])
            ).to.be.rejectedWith("Transfer to the zero address");
        });

        it("Check if wallet that have enough balance doesnot throw error", async () => {
            const { contract, owner, addr2 } = await loadFixture(
                deployTokenFixture
            );
            const tokenAsOwner = await hre.viem.getContractAt(
                "TestToken",
                contract.address,
                { walletClient: owner }
            );
            await expect(
                tokenAsOwner.write.transfer([
                    addr2.account.address,
                    BigInt(1000),
                ])
            ).to.not.rejected;

            expect(
                await tokenAsOwner.read.balanceOf([addr2.account.address])
            ).to.equal(BigInt(1000));
        });

        it("Check if error is thrown if negative value to transfer is given", async () => {
            const { contract, owner, addr2 } = await loadFixture(
                deployTokenFixture
            );
            const tokenAsOwner = await hre.viem.getContractAt(
                "TestToken",
                contract.address,
                { walletClient: owner }
            );
            await expect(
                tokenAsOwner.write.transfer([addr2.account.address, BigInt(-1)])
            ).to.be.rejected;
        });
    });
});
