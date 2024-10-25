import "@nomicfoundation/hardhat-verify";
import "dotenv/config";
import { artifacts, ethers, run } from 'hardhat';
import { FtsoV2FeedConsumerContract } from '../typechain-types';
const FtsoV2FeedConsumer: FtsoV2FeedConsumerContract = artifacts.require('FtsoV2FeedConsumer');


const { API_URL, API_KEY } = process.env


async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);


    const feedConsumer = await FtsoV2FeedConsumer.new()

    try {
        const result = await run("verify:verify", {
            address: feedConsumer.address,
            constructorArguments: [],
        })

        console.log(result)
    } catch (e: any) {
        console.log(e.message)
    }
}

main().then(() => process.exit(0))