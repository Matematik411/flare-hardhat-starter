

// type of our contract
import { FtsoV2FeedConsumerContract } from '../typechain-types';

const FtsoV2FeedConsumer: FtsoV2FeedConsumerContract = artifacts.require('FtsoV2FeedConsumer');


describe('ReadPrice', async () => {

    beforeEach(async () => {

    })

    it("Should get price", async () => {
        const ftsoV2FeedConsumer = await FtsoV2FeedConsumer.new();
        console.log(ftsoV2FeedConsumer.address);
        const a = await ftsoV2FeedConsumer.getFtsoV2CurrentFeedValuesByName(["BTC", "XRP"])
        console.log(a[0].map((x: any) => x.toString()));
    })

})