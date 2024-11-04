import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";
import { artifacts, ethers } from 'hardhat';
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
                    "postprocessJq": "360", // repetitions
                    "abi_signature": "{\"struct Song\":{\"verse\":\"bytes\", \"comment\":\"bytes\", \"more\":\"bytes\"}}"
                }
            })
        })).json();
}




async function main() {
    const attestationData = await getAttestationData(1730300000);

    console.log(attestationData.response);
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);


    // const encAddress = "0xEF462dF6a439871aC4394aCb58b7E54271F0a6b1";
    // const encoder: EncodingTestInstance = await EncodingTest.at(encAddress);
    const encoder: EncodingTestInstance = await EncodingTest.new();

    const data = await encoder.addSong(attestationData.response); // gasLimit override can't be added here
    console.log(data);

    const result = await encoder.songs(0);
    console.log(result);
    // this has duplicated informations stored ! 
    // result["verse"] == result["0"] ??
    // this is desired behaviour as per https://stackoverflow.com/questions/76072623/why-struct-returns-duplicate-values-as-index-in-solidity
    // console.log("----------------------")
    // console.log(result.verse)
    // console.log(result["verse"])
    // console.log(result["0"])
    // console.log(result[0])

    // // poskus gasLimit spremembe - NE spremeni
    // const encodingContract = new ethers.Contract(encAddress, EncodingAbi, deployer);
    // console.log(encodingContract)
    // console.log(await encodingContract.songs(1))
    // // const tx = await encodingContract.addSong(attestationData.response, { gasLimit: 20000000 });
    // const tx = await encodingContract.addSong(attestationData.response);
    // // const tx = await encodingContract.addSong(attestationData.response);
    // console.log(tx)


    // // tudi to ne dela
    // const txRequest = await encoder.populateTransaction.addSong(attestationData.response);
    // txRequest.gasLimit = parseUnits("200000", "wei");
    // const txResponse = await deployer.sendTransaction(txRequest);

    // ---------------------------------------------------------
    // results for string:
    // working:
    // 10*20, 10*1.000 (spends 7.2 M gas)

    // not working:
    // ....... gas required exceeds allowance (8000000) 
    // 10*1.500, 10*5.000, 10*10.000
    // ---------------------------------------------------------
    // results for bytes:
    // working:
    // 10*20, 10*1.100 (spends 7.9 M gas)

    // not working:
    // ....... gas required exceeds allowance (8000000) 
    // 10*1.200
    // ---------------------------------------------------------
    // results for multiple bytes:
    // working:
    // 10*360*3 still works despite being split into 3 separate bytes 
    // ---------------------------------------------------------
}

main().then(() => process.exit(0))