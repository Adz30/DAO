const hre = require("hardhat");
const config = require('../src/config.json')


const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), "ether");
  };
  
  const ether = tokens

async function main(){
    console.log(`Fetching accounts & network... \n`)
    
const accounts = await ethers.getSigners();
funder = accounts[0];
investor1 = accounts[1];
investor2 = accounts[2];
investor3 = accounts[3];
recipient = accounts[4]

let transaction

const { chainId } = await ethers.provider.getNetwork()

console.log(`Fetching token and transferring to accounts... \n`)

const token = await ethers.getContractAt('Token', config[chainId].token.address)
console.log(`Token fetched: ${token.address}\n`)

transaction = await token.transfer(investor1.address, tokens(200000))
await transaction.wait()

transaction = await token.transfer(investor2.address, tokens(200000))
await transaction.wait()

transaction = await token.transfer(investor3.address, tokens(200000))
await transaction.wait()

const dao = await ethers.getContractAt('DAO', config[chainId].dao.address)
console.log(`DAO fetched: ${dao.address}\n`)

transaction = await funder.sendTransaction({ to: dao.address, value: ether(1000) })
await transaction.wait()
console.log(`Sent funds to dao treasury...\n`)

for (var i = 0; i < 3; i++) {
    transaction = await dao.connect(investor1).vote(i + 1)
    await transaction.wait()

    transaction = await dao.connect(investor2).vote(i + 1)
    await transaction.wait()

    transaction = await dao.connect(investor3).vote(i + 1)
    await transaction.wait()

    transaction = await dao.connect(investor1).finalizeProposal(i + 1)
    await transaction.wait()

    console.log(`Created & finalized Proposal ${i + 1}\n`)

}

console.log(`Creating one more proposal...\n`)

transaction = await dao.connect(investor1).createProposal(`Proposal 4`, ether(100), recipient.address)
await transaction.wait()

transaction = await dao.connect(investor2).vote(4)
await transaction.wait()

transaction = await dao.connect(investor3).vote(4)
await transaction.wait()

console.log(`Finished.\n`)


}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});