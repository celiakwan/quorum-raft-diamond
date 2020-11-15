const {v4: uuidv4} = require('uuid');
const Web3 = require('web3');
const web3 = new Web3();

const registrationNumber = uuidv4();
const carat = '1.2';
const shape = 'Round';
const cut = 'Brilliant';
const clarity = 'VS1';
const color = 'G';
const url = 'https://example.com/scan/D00001';
const filePath = 'test/tx.txt';

const decodeParameters = data => {
    const typesArray = [
        {type: 'uint256', name: 'tokenId'}, 
        {type: 'string', name: 'registrationNumber'},
        {type: 'string', name: 'url'},
        {type: 'address', name: 'owner'},
    ];
    
    return web3.eth.abi.decodeParameters(typesArray, data);
};

module.exports = {
    registrationNumber,
    carat,
    shape,
    cut,
    clarity,
    color,
    url,
    filePath,
    decodeParameters
};