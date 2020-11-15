const assert = require('assert');
const {promises: fs} = require('fs');
const h = require('./helper.js');

const Diamond = artifacts.require('Diamond');

const nodeOneAcct = '0xf9a805bCDe6a343997AF88bd4cF4379f6c0f6e66';

/**
 * If tx.txt cannot be read, change registrationNumber and tx to the values 
 * printed in the console after executing Diamond-node1.js
*/
let registrationNumber = '';
let tx = '';

module.exports = async done => {
    try {
        const diamond = await Diamond.deployed();

        try {
            const data = await fs.readFile(h.filePath);
            const lines = data.toString().split('\n');
            registrationNumber = lines[0];
            tx = lines[1];
        } catch(e) {
            console.error(e);
        }

        // Test case 1
        console.log('Getting transaction logs...');
        const receipt = await web3.eth.getTransactionReceipt(tx);
        const args = h.decodeParameters(receipt.logs[1].data);

        assert.strictEqual(receipt.logs.length, 2, 'Incorrect number of logs');
        assert.strictEqual(args.registrationNumber, registrationNumber, 'Incorrect registration number');
        assert.strictEqual(args.url, h.url, 'Incorrect URL');
        assert.strictEqual(args.owner, nodeOneAcct, 'Incorrect owner account');

        // Test case 2
        console.log('Getting diamond metadata...');
        const metadata = await diamond.getMetadata(0);
        assert.strictEqual(metadata.carat, h.carat, 'Incorrect carat');
        assert.strictEqual(metadata.shape, h.shape, 'Incorrect shape');
        assert.strictEqual(metadata.cut, h.cut, 'Incorrect cut');
        assert.strictEqual(metadata.clarity, h.clarity, 'Incorrect clarity');
        assert.strictEqual(metadata.color, h.color, 'Incorrect color');

        done();
    } catch(e) {
        console.error(e);
        done();
    }
};
