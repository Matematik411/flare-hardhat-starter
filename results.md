# Findings about the maximum size of sent data

The error of abi encoding/decoding failing was not reproduced. All the errors I
managed to produce were the limits of the maximum gas spent due to the amount
of characters that were being sent to the network.

This gas limit on Coston and Coston2 networks is set to 8 million gas and I could
not find a way to override this. The transactions that were successful all needed
to have their gas lower than the 8 million. The amount of data sent was limited
to:
- `11000` characters if the type is a single string or a single bytes message.
- in the case of a custom struct (as in the [EncodingTest contract](https://github.com/Matematik411/flare-hardhat-starter/blob/maxGasTesting/contracts/EncodingTest.sol)), the number of information is still almost the same. The case with `11000=5*2200` fails due to too much gas used, but the transaction with `10500=5*2100` characters is successful.

These size limitations are fixed, below I quickly describe the different approaches
I tried to get around this or to see what happens when working with *hardhat* in
combination with *remix* for both deploying the contract and sending the transactions.


## Deploying with hardhat

- Deploy with *abis from artifacts* (as in the [encode example script](https://github.com/Matematik411/flare-hardhat-starter/blob/encode-hackathon/scripts/jsonApiExample.ts)) works. The overrides cannot be used in transactions calling the methods of the contract. If I try to use them, the code does not compile, as there are *too many arguments* given to the method call.
- Deploy with `new ethers.Contract` works and allows the use of overrides in made transactions. For the `gasLimit` override, the following holds:
  - it still cannot be set to anything above 8 million (`ProviderError: exceeds block gas limit: tx gas (9000000) > current max gas (8000000)`).
  - if the limit is set to a value lower than what transaction needs, the transaction fails (example tx hash `0x11a8e7888dce9b363f0953648c7327d6e90d2a42f45173ead46d0f25d1bc6f7b`).

## Deploying with remix

- No special limitations or overrides can be made here. You can deploy a contract or use an existing contract. 

## Transactions on remix

The transactions made on *remix* also cannot be modified to have a gas limit higher than 8 million, but can otherwise be executed well. This is the same no matter how the contract was deployed. The following cases exist:
- Deploying a contract with a transaction with gas limit more than 8 million is not executed (with error message `If the transaction failed for not having enough gas, try increasing the gas limit gently.`)
- If the gas limit for the transaction is set lower than the (estimated) gas required for the transaction, I am attempting to make, the transaction is not executed (with error message `transact to EncodingTest.addSong errored: estimated gas for this transaction (7354030) is higher than gasLimit set in the configuration  (0xf4240). Please raise the gas limit.`).
- If the gas limit is not set (the *Estimated Gas* option is selected) and I try to make a transaction that will use too much gas two things happen:
  - First, a pop up window notifies me that the fas estimation failed (with message `gas required exceeds allowance (8000000)`).
  - If I still select to send the transaction, this transaction fails - the same way as the hardhat sent transation did (example tx hash `0x9333fc53f54944a4e39d1256599e87df98bb04e668f53ba2d9de47c6960dc46c`). 


