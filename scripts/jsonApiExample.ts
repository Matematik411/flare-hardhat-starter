import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";
import { parseUnits } from "ethers";
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
                    "postprocessJq": "1000", // repetitions
                    "abi_signature": "{\"struct Song\":{\"verse\":\"string\"}}"
                }
            })
        })).json();
}




async function main() {
    const attestationData = await getAttestationData(1730300000);

    console.log(attestationData.response);

    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // const encoder: EncodingTestInstance = await EncodingTest.new()
    const encoder: EncodingTestInstance = await EncodingTest.at("0xEF462dF6a439871aC4394aCb58b7E54271F0a6b1") //new()

    console.log(parseUnits("200000", "wei"))
    await encoder.addSong(attestationData.response, { gasLimit: parseUnits("200000", "wei") });


    const result = await encoder.songs(0);
    console.log(result);


    // // tudi to ne dela
    // const txRequest = await encoder.populateTransaction.addSong(attestationData.response);
    // txRequest.gasLimit = parseUnits("200000", "wei");
    // const txResponse = await deployer.sendTransaction(txRequest);

    // ---------------------------------------------------------
    // results for string:
    // working:
    // 10*20, 10*1.000 (spends 7.1 M gas)

    // not working:
    // ....... gas required exceeds allowance (8000000) 
    // 10*1.500, 10*5.000, 10*10.000
    // ---------------------------------------------------------
}

main().then(() => process.exit(0))