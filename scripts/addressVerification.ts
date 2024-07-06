//import script packages
import { AddressValidity } from "@flarenetwork/state-connector-protocol/dist/generated/types/typescript/index.js";
import { encodeAttestationName } from '@flarenetwork/state-connector-protocol/dist/libs/ts/utils.js';
import dotenv from "dotenv";
import { ethers } from "ethers";
import AddressValidityVerificationABI from "../artifacts/@flarenetwork/state-connector-protocol/contracts/generated/verification/AddressValidityVerification.sol/AddressValidityVerification.json" assert { type: 'json' };

dotenv.config();

//Intialize script variables

const Wallet_Key = "0x871d88f14e8af00e0597ebf499efca2a8e8be159c0acbc5db4309f87c43c6139";
const API_KEY = "123456";
// console.log("Wallet_Key", Wallet_Key);
// console.log(process.env)
const addressToValidate = "tb1qrre8akk5tp4yejrqeucvm78jqhw7p5nn4arqpz";
const FLARE_PACKAGE = "@flarenetwork/flare-periphery-contract-artifacts";
const FLARE_RPC = "https://coston-api.flare.network/ext/C/rpc";
const providers = new ethers.JsonRpcProvider(FLARE_RPC);
const signer = new ethers.Wallet(Wallet_Key, providers);

// Async function to prepare Attestation Request using API endpoint parameter request object returns object.
async function prepareRequest(requestBody) {

    const response = await fetch("https://attestation-coston.aflabs.net/verifier/btc/AddressValidity/prepareRequest", {
        method: "POST",
        headers: { "X-API-KEY": API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
    });
    const data = await response.json();
    console.log("Prepared Request", data)
    return data;

}

//Async function to request attestation from the StateConnector parameter prepared request object returns Number RoundId
async function getAttestation(data) {

    const flare = await import(FLARE_PACKAGE);

    const flareContractRegistry = new ethers.Contract(
        "0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019",
        flare.nameToAbi("FlareContractRegistry", "coston").data, signer);
    const stateConnectorAddress = await flareContractRegistry.getContractAddressByName("StateConnector");

    const stateConnector = new ethers.Contract(stateConnectorAddress, flare.nameToAbi("StateConnector", "coston").data,
        signer);
    //Request attestation from StateConnector
    const tx = await stateConnector.requestAttestations(data.abiEncodedRequest);
    const receipt = await tx.wait();
    const blockNumber = receipt.blockNumber;

    const block = await providers.getBlock(blockNumber);

    // BUFFER_TIMESTAMP_OFFSET
    const BUFFER_TIMESTAMP_OFFSET = await stateConnector.BUFFER_TIMESTAMP_OFFSET();

    //BUFFER_WINDOW
    const BUFFER_WINDOW = await stateConnector.BUFFER_WINDOW();
    //calculate roundId
    const bigroundId = (BigInt(block.timestamp) - BUFFER_TIMESTAMP_OFFSET) / BUFFER_WINDOW;
    const scRound = Number(bigroundId);
    console.log("scRound;", scRound);

    return scRound;//Return roundId
}

//Async function to verify StateConnector atestation using verifier's API, parameters Number,Object.
async function testAttestation(scRound, requestData) {

    const attestationProof = {
        "roundId": scRound,
        "requestBytes": requestData.abiEncodedRequest
    };

    const response = await fetch(
        "https://attestation-coston.aflabs.net/attestation-client/api/proof/get-specific-proof",
        {
            method: "POST",
            headers: { "X-API-KEY": API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify(attestationProof)
        }
    );
    //Verified attesation proof from verifiers API endpoint.
    const data = await response.json();
    console.log(data);

    // Unpacked attesatation proof to be used in a Solidity contract.
    let fullProof = {
        merkleProof: data.data.merkleProof,
        data: {
            roundID: data.data.roundId,
            hash: data.data.hash,
            requestByte: data.data.requestBytes,
            attestationType: data.data.request.attestationType,
            messageIntegrityCode: data.data.request.messageIntegrityCode,
            lowestUsedTimestamp: data.data.response.lowestUsedTimestamp,
            sourceId: data.data.response.sourceId,
            votingRound: data.data.response.votingRound,
            status: data.status,
            requestBody: data.data.response.requestBody,
            responseBody: data.data.response.responseBody

        }
    };


    // console.log(fullProof)
    console.log("fullproof", fullProof);
    const addressVerifier = new ethers.Contract("0x67743178E5386c2f33b7f84249EcDDe5e15483BB", AddressValidityVerificationABI.abi, signer);
    // Function call to a Solidity contract that will make use of proof.
    const tx = await addressVerifier.verifyAddressValidity(fullProof);
    console.log("Attestation:", tx);

}
async function AddressValidity_run() {

    const tx = "0xede799854866d4611368541b48acef81dcc7a67cf23341e0f5d78adf1b31dad3"

    const receipt = await providers.getTransactionReceipt(tx);

    console.log(receipt);


    return

    const ATTESTATION_TYPE_NAME = AddressValidity.NAME;
    const ATTESTATION_TYPE = AddressValidity.TYPE;

    const sourceType = encodeAttestationName("testBTC");

    //Attestation Request object to be sent to API endpoint
    const requestNoMic = {
        "attestationType": ATTESTATION_TYPE,
        "sourceId": sourceType,
        "requestBody": {
            "addressStr": addressToValidate
        }
    }
    try {
        const preparedData = await prepareRequest(requestNoMic);
        const scRound = await getAttestation(preparedData);
        setTimeout(() => {
            testAttestation(scRound, preparedData);
        }, 340000);
    }
    catch (error) {
        console.error(error);
    }

}




AddressValidity_run();