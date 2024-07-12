import "@nomicfoundation/hardhat-verify";
import { artifacts, ethers, run } from 'hardhat';
import { FtsoV2FeedConsumerContract } from '../typechain-types';
const FtsoV2FeedConsumer: FtsoV2FeedConsumerContract = artifacts.require('FtsoV2FeedConsumer');


async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const args: any[] = []
    const ftsoV2FeedConsumer = await FtsoV2FeedConsumer.new(...args);
    console.log("FtsoV2FeedConsumer deployed to:", ftsoV2FeedConsumer.address);
    try {

        const result = await run("verify:verify", {
            address: ftsoV2FeedConsumer.address,
            constructorArguments: args,
        })

        console.log(result)
    } catch (e: any) {
        console.log(e.message)
    }
    console.log("Deployed contract at:", ftsoV2FeedConsumer.address)

}
main().then(() => process.exit(0))