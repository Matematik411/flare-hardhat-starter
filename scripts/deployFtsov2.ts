import "@nomicfoundation/hardhat-verify";
import "dotenv/config";
import { artifacts, ethers, run } from 'hardhat';
import { EncodingTestContract } from '../typechain-types';
const EncodingTest: EncodingTestContract = artifacts.require('EncodingTest');


const { API_URL, API_KEY } = process.env


async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);


    const encodingTest = await EncodingTest.new()

    try {
        const result = await run("verify:verify", {
            address: encodingTest.address,
            constructorArguments: [],
        })

        console.log(result)
    } catch (e: any) {
        console.log(e.message)
    }
}

main().then(() => process.exit(0))