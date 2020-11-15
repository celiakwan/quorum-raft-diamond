const assert = require('assert');
const fs = require('fs');
const h = require('./helper.js');

const Diamond = artifacts.require('Diamond');

const admin = '0x0000000000000000000000000000000000000000';
const nodeOneAcct = '0xf9a805bCDe6a343997AF88bd4cF4379f6c0f6e66';
const nodeOnePubKey = 'PuVWL5epvJVyJx+IKlkKhFn43aYwi7Z4h5Av4bRcpy0=';
const nodeTwoPubKey = 'piVBvmX3ZC0/MgreH2M/SPXVja9RGH/5YPY8ITkd1QI=';
const registrationNumber = h.registrationNumber;

module.exports = async done => {
    try {
        const diamond = await Diamond.deployed();

        // Test case 1
        console.log('Checking if the smart contract is deployed with correct values...');
        const name = await diamond.name.call();
        const symbol = await diamond.symbol.call();

        assert.strictEqual(name, 'Diamond', 'Incorrect token name');
        assert.strictEqual(symbol, 'DMD', 'Incorrect token symbol');

        // Test case 2
        console.log('Creating a token...');
        const mint = await diamond.mint(
            registrationNumber,
            h.carat,
            h.shape,
            h.cut,
            h.clarity,
            h.color,
            h.url,
            nodeOneAcct,
            {privateFor: [nodeOnePubKey, nodeTwoPubKey]}
        );

        assert.strictEqual(mint.receipt.status, true, 'Creation failed');
        assert.strictEqual(mint.logs[0].args.from, admin, 'Incorrect sender account');
        assert.strictEqual(mint.logs[0].args.to, nodeOneAcct, 'Incorrect recipient account');
        assert.strictEqual(mint.logs[1].args.registrationNumber, registrationNumber, 'Incorrect registration number');
        assert.strictEqual(mint.logs[1].args.url, h.url, 'Incorrect URL');
        assert.strictEqual(mint.logs[1].args.owner, nodeOneAcct, 'Incorrect owner account');

        const tx = mint.tx;
        console.log(`registrationNumber: ${registrationNumber}`);
        console.log(`tx: ${tx}`);

        const data = `${registrationNumber}\n${tx}`;
        fs.writeFile(h.filePath, data, e => { 
            if (e) {
                console.error(e);
            }
        });

        // Test case 3
        console.log('Getting transaction logs...');
        const receipt = await web3.eth.getTransactionReceipt(tx);
        assert.strictEqual(receipt.logs.length, 2, 'Incorrect number of logs');
    
        // Test case 4
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
