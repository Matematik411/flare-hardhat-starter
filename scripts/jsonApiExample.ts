import "@nomicfoundation/hardhat-verify";
import "dotenv/config";
import { artifacts, ethers, run } from 'hardhat';
import { JsonApiExampleContract } from '../typechain-types';
import { JsonApiExampleInstance } from "../typechain-types/contracts/web2WeatherInteractor.sol/JsonApiExample";
const JsonApiExample: JsonApiExampleContract = artifacts.require('JsonApiExample');


const { OPEN_WEATHER_API_KEY } = process.env

const VERIFIER_SERVER_URL = "http://localhost:3000/IJsonApi/prepareResponse";

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
                    "url": `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=39.099724&lon=-94.578331&dt=${timestamp}&appid=${OPEN_WEATHER_API_KEY}`,
                    "postprocessJq": "{latitude:(.lat*pow(10;6)),longitude:(.lon*pow(10;6)),temperature:(.data[0].temp*pow(10;6)),wind_speed:(.data[0].wind_speed*pow(10;6)),wind_deg:.data[0].wind_deg,timestamp:.data[0].dt,description:[.data[0].weather[].description]}",
                    "abi_signature": "{\"struct Weather\":{\"latitude\":\"int256\",\"longitude\":\"int256\",\"temperature\":\"uint256\",\"wind_speed\":\"uint256\",\"wind_deg\":\"uint256\",\"timestamp\":\"uint256\",\"description\":\"string[]\"}}"
                }
            })
        })).json();
}




async function main() {
    const attestationData = await getAttestationData(1729858394);

    console.log(attestationData.response);

    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const jsonApi: JsonApiExampleInstance = await JsonApiExample.at("0xf37e9ACe5D12a95C72Cb795A9178E6fFF34040eE") //new()

    await jsonApi.addWeather(attestationData.response);

    try {
        const result = await run("verify:verify", {
            address: jsonApi.address,
            constructorArguments: [],
        })

        console.log(result)
    } catch (e: any) {
        console.log(e.message)
    }


}

main().then(() => process.exit(0))