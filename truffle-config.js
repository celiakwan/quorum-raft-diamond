module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 22000,
      network_id: "*",
      gasPrice: 0,
      gas: 4500000,
      type: "quorum"
    },
    nodeTwo: {
      host: "127.0.0.1",
      port: 22001,
      network_id: "*",
      gasPrice: 0,
      gas: 4500000,
      type: "quorum"
    },
    nodeThree: {
      host: "127.0.0.1",
      port: 22002,
      network_id: "*",
      gasPrice: 0,
      gas: 4500000,
      type: "quorum"
    }
  },
  mocha: {
  },
  compilers: {
    solc: {
      version: "^0.5.17",
      settings: {
        evmVersion: 'constantinople',
      }
    }
  }
};