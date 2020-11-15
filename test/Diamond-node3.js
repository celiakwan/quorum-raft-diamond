const assert = require('assert');
const {promises: fs} = require('fs');
const h = require('./helper.js');

const Diamond = artifacts.require('Diamond');

/**
 * If tx.txt cannot be read, change tx to the value printed 
 * in the console after executing Diamond-node1.js
*/
let tx = '';

module.exports = async done => {
    try {
        const diamond = await Diamond.deployed();

        try {
            const data = await fs.readFile(h.filePath);
            const lines = data.toString().split('\n');
            tx = lines[1];
        } catch(e) {
            console.error(e);
        }

        // Test case 1
        console.log('Getting transaction logs...');
        const receipt = await web3.eth.getTransactionReceipt(tx);
        assert.strictEqual(receipt.logs.length, 0, 'Incorrect number of logs');

        // Test case 2
        console.log('Getting diamond metadata...');
        let f;
        try {
            await diamond.getMetadata(0);
        } catch(e) {
            f = () => {throw e};
        } finally {
            assert.throws(f, /Returned values aren't valid/, 'Party who is not privy to the token contract cannot get the metadata');
        }

        done();
    } catch(e) {
        console.error(e);
        done();
    }
};
