import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";
import { artifacts, ethers } from 'hardhat';
import { EncodingSimpleContract, EncodingSimpleInstance } from '../typechain-types';
const EncodingSimple: EncodingSimpleContract = artifacts.require('EncodingSimple');


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
                    "postprocessJq": "1100", // repetitions
                    "abi_signature": "bytes"
                }
            })
        })).json();
}




async function main() {
    const attestationData = await getAttestationData(1730300000);

    console.log(attestationData.response);
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);



    // const encAddress = "123"
    // const encoder: EncodingSimpleInstance = await EncodingSimple.at(encAddress);
    const encoder: EncodingSimpleInstance = await EncodingSimple.new();
    const data = await encoder.addSong(attestationData.response);
    console.log(data);
    const result = await encoder.songs(0);
    console.log(result);

    // ---------------------------------------------------------
    // this is without the wrapping struct
    // the costs are basically the same
    // ---------------------------------------------------------
}

main().then(() => process.exit(0))