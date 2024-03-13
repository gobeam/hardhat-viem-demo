import hre from "hardhat";

async function main() {
  const [owner] = await hre.viem.getWalletClients();

    const testCoinContract = await hre.viem.deployContract(
        "TestToken" as never,
        ["1000000000"]
    );
    console.log(`TestToken deployed to ${testCoinContract.address} by ${owner.account.address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
