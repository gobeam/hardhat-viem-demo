const fs = require("fs");
const path = require("path");

const artifactsDir = path.join(__dirname, "artifacts/contracts");
async function main() {
    // Ensure the 'abis' directory exists
    const outputDir = "./abis";
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // Read the contracts directory and extract the ABIs for each contract
    fs.readdirSync(artifactsDir, { withFileTypes: true }).forEach((dirent) => {
        if (dirent.isDirectory()) {
            const contractDir = path.join(artifactsDir, dirent.name);
            fs.readdirSync(contractDir).forEach((file) => {
                if (file.endsWith(".json")) {
                    const artifactPath = path.join(contractDir, file);
                    const artifact = JSON.parse(
                        fs.readFileSync(artifactPath, "utf8")
                    );

                    // Check if the ABI exists in the artifact
                    if (!artifact.abi) {
                        console.error(
                            `ABI not found in artifact: ${artifactPath}`
                        );
                        return;
                    }

                    const abi = artifact.abi;
                    const abiFileName = `${path.parse(file).name}ABI.json`;
                    const abiFilePath = path.join(outputDir, abiFileName);

                    // Save the ABI to a separate file
                    fs.writeFileSync(
                        abiFilePath,
                        JSON.stringify(abi, null, 2),
                        "utf8"
                    );
                    console.log(
                        `ABI for ${
                            path.parse(file).name
                        } saved to ${abiFilePath}`
                    );
                }
            });
        }
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
