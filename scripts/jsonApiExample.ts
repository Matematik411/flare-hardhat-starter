import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";
import { artifacts, ethers } from 'hardhat';
import { abi as EncodingAbi } from '../artifacts/contracts/EncodingTest.sol/EncodingTest.json';
import { EncodingTestContract, EncodingTestInstance } from '../typechain-types';
const EncodingTest: EncodingTestContract = artifacts.require('EncodingTest');


const VERIFIER_SERVER_URL = "http://localhost:3100/IJsonApi/prepareResponse";

async function getAttestationData(timestamp: number): Promise<any> {

    return await (await fetch(VERIFIER_SERVER_URL,
        {
            method: "POST",
            headers: { "X-API-KEY": "12345", "Content-Type": "application/json" },
            body: JSON.stringify({
                "attestationType": "0x4a736f6e41706900000000000000000000000000000000000000000000000000",
                "sourceId": "0x5745423200000000000000000000000000000000000000000000000000000000",
                "messageIntegrityCode": "0x0000000000000000000000000000000000000000000000000000000000000000",
                "requestBody": {
                    "url": `testing123`, // starting string
                    "postprocessJq": "200", // repetitions
                    "abi_signature": "{\"struct Song\":{\"verse\":\"bytes\", \"comment\":\"bytes\", \"more\":\"bytes\", \"expansion\":\"string\", \"epilogue\":\"string\"}}"
                }
            })
        })).json();
}


async function main() {
    // get attestation data
    const attestationData = await getAttestationData(1730300000);
    console.log(attestationData.response);
    // get sender account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);


    // deploy with abis from artifacts
    // contract can be new or old
    const encAddress = "0xFa5ACe840eB05133a91229b419C34918884404d9"; // coston 
    const encoder: EncodingTestInstance = await EncodingTest.at(encAddress);
    // const encoder: EncodingTestInstance = await EncodingTest.new();
    const data = await encoder.addSong(attestationData.response); // gasLimit override can't be added here
    console.log(data);

    // deploy with "new ethers.Contract"
    const encodingContract = new ethers.Contract(encAddress, EncodingAbi, deployer);
    const tx = await encodingContract.addSong(attestationData.response, { gasLimit: 4000000 });
    console.log(tx)



    // remark: when reading saved data on the contract, it appears that it is duplicated
    // as result["verse"] == result[0]
    // apparently this is desired behaviour per
    // https://stackoverflow.com/questions/76072623/why-struct-returns-duplicate-values-as-index-in-solidity
    const result = await encoder.songs(0);
    console.log(result);


    // did not manage to send transactions via populateTransaction or other similar ways
    // const txRequest = await encoder.populateTransaction.addSong(attestationData.response);
    // txRequest.gasLimit = parseUnits("200000", "wei");
    // const txResponse = await deployer.sendTransaction(txRequest);

}

main().then(() => process.exit(0))