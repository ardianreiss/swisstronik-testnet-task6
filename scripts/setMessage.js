const hre = require("hardhat");
const { encryptDataField, decryptNodeResponse } = require("@swisstronik/utils");
const fs = require("fs");

const sendShieldedTransaction = async (signer, destination, data, value) => {
  const rpclink = hre.network.config.url;
  const [encryptedData] = await encryptDataField(rpclink, data);
  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

async function main() {
  const contractAddress = fs.readFileSync("proxiedContract.txt", "utf8").trim();
  const [signer] = await hre.ethers.getSigners();
  const contractFactory = await hre.ethers.getContractFactory("Swisstronik");
  const contract = contractFactory.attach(contractAddress);
  const functionName = "setMessage";
  const messageToSet = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent blandit auctor lectus, eu molestie sapien. In ac suscipit lectus. Cras rhoncus urna in libero dignissim luctus. Aenean felis nisl, tincidunt rutrum convallis ut, maximus pulvinar sem. Pellentesque nec velit orci. Curabitur egestas condimentum facilisis. In placerat fermentum leo id imperdiet. Morbi condimentum, massa in egestas bibendum, massa enim finibus sem, ut ornare neque sapien in dolor.";
  const setMessageTx = await sendShieldedTransaction(signer, contractAddress, contract.interface.encodeFunctionData(functionName, [messageToSet]), 0);
  await setMessageTx.wait();
  console.log("Transaction Receipt: ", setMessageTx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
