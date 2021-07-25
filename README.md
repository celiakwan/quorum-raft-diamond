# quorum-raft-diamond
This project aims to tokenize diamonds using ERC-721 standard in a private Quorum blockchain network. It also demonstrates how to set up 3 Quorum and Tessera nodes with Raft consensus, and how to send private transactions between nodes.

### Version
- [GoQuorum](https://docs.goquorum.consensys.net/en/stable/): 20.10.0
- [Tessera](https://docs.tessera.consensys.net/en/stable/): 20.10.0
- [Go](https://golang.org/): 1.15.4
- [Solidity](https://solidity.readthedocs.io/): 0.5.17
- [Truffle](https://www.trufflesuite.com/): 5.0.14
- [Web3.js](https://web3js.readthedocs.io/): 1.0.0-beta.37
- [Node.js](https://nodejs.org/en/): 15.1.0
- [@openzeppelin/contracts](https://openzeppelin.com/): 2.5.1

### Installation
Install Go.
```
brew install golang
```

Install Node.js.
```
brew install node
```

Install Truffle globally.
```
npm install truffle -g
```

Install the required Node.js packages in this project including `@openzeppelin/contracts`.
```
npm install
```

### Build
###### Quorum
1. Clone the Quorum repository and build the source.
    ```
    git clone https://github.com/ConsenSys/quorum.git
    cd quorum
    make all
    ```

2. Add the directory where contains binaries to run `geth` and `bootnode` to `PATH`,
    ```
    export PATH=/Users/celia/path/to/quorum/build/bin:$PATH
    ```
    
    or copy the binaries to a default directory in `PATH`.
    ```
    cp build/bin/geth /usr/local/bin
    cp build/bin/bootnode /usr/local/bin
    ```

3. Create a project directory.
    ```
    cd ..
    mkdir quorum-raft-diamond
    cd quorum-raft-diamond
    ```

4. Create a directory for Quorum nodes.
    ```
    mkdir quorum
    cd quorum
    ```

5. Create node directories. We have 3 Quorum nodes in this project.
    ```
    mkdir node-1
    mkdir node-2
    mkdir node-3
    ```

6. Generate an account for each node.
    ```
    geth --datadir node-1 account new
    geth --datadir node-2 account new
    geth --datadir node-3 account new
    ```

7. Create a `genesis.json` file,
    ```
    vim genesis.json
    ```

    and add the account addresses generated to `"alloc"`. For example:
    ```
    {
        "alloc": {
            "0xf9a805bCDe6a343997AF88bd4cF4379f6c0f6e66": {
                "balance": "1000000000000000000000000000"
            },
            "0xB81B7293CC5Bd35FdC28d12b60Aa744b2839E822": {
                "balance": "1000000000000000000000000000"
            },
            "0xE797d590926b72b4F75Ec8828E5A2B8D0525f63c": {
                "balance": "1000000000000000000000000000"
            }
        },
        "coinbase": "0x0000000000000000000000000000000000000000",
        "config": {
            "homesteadBlock": 0,
            "byzantiumBlock": 0,
            "constantinopleBlock": 0,
            "chainId": 10,
            "eip150Block": 0,
            "eip155Block": 0,
            "eip150Hash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "eip158Block": 0,
            "maxCodeSizeConfig": [
                {
                    "block": 0,
                    "size": 35
                }
            ],
            "isQuorum": true
        },
        "difficulty": "0x0",
        "extraData": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "gasLimit": "0xE0000000",
        "mixhash": "0x00000000000000000000000000000000000000647572616c65787365646c6578",
        "nonce": "0x0",
        "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "timestamp": "0x00"
    }
    ```

8. Generate a node key for each node.
    ```
    cd node-1
    bootnode --genkey=nodekey
    cd ../node-2
    bootnode --genkey=nodekey2
    cd ../node-3
    bootnode --genkey=nodekey3
    ```

    Note: The node key filename of node one should remain unchanged (i.e. `nodekey`). Otherwise, it might throw `Fatal: failed to find local enode ID (xxxxx) amongst peer IDs: [xxxxx xxxxx xxxxx]` when starting the node.
    &nbsp;

9. Get the enode ID of each node.
    ```
    cd ..
    bootnode --nodekey=node-1/nodekey --writeaddress
    bootnode --nodekey=node-2/nodekey2 --writeaddress
    bootnode --nodekey=node-3/nodekey3 --writeaddress
    ```

10. Create a `static-nodes.json` file,
    ```
    cd node-1
    vim genesis.json
    ```

    and add the enode ID, IP and port for devp2p, and Raft port. For example:
    ```
    [
        "enode://92b3ce30961349329f375f15b976f9408d892c1c18040c9a4c59e1fa78c646279d7758de4b32731af5d4143a4209a2cee8b387a2603bc1f3855b45e7fcc13329@127.0.0.1:21000?discport=0&raftport=50000",
        "enode://23aa8e72c257d92d78e026f52bbf14025c478f486c36e574603217fe3ec87ee53f161a590f3c30143d119898867f9b41af2b660d2b9373109b4d5add4803ad27@127.0.0.1:21001?discport=0&raftport=50001",
        "enode://c4889a17443b5f0a185d5ca33a38056777afeb70788eb1b1d2d8b0bbe7ac962be44da40b4ece69d044e96f7e32215053a7a88f4babe5dbebaa8ff5f85116c6d3@127.0.0.1:21002?discport=0&raftport=50002"
    ]
    ```

    Copy the `static-nodes.json` file to other node directories.
    ```
    cp genesis.json ../node-2
    cp genesis.json ../node-3
    ```

11. Initialize each node.
    ```
    cd ..
    geth --datadir node-1 init genesis.json
    geth --datadir node-2 init genesis.json
    geth --datadir node-3 init genesis.json
    ```

12. Create scripts to start the nodes.
    ```
    vim startnode1.sh
    ```

    Script to start node one:
    ```
    #!/bin/bash
    PRIVATE_CONFIG=/Users/celia/path/to/quorum-raft-diamond/tessera/node-1t/tm.ipc nohup geth --datadir /Users/celia/path/to/quorum-raft-diamond/quorum/node-1 --nodiscover --verbosity 5 --networkid 31337 --raft --raftport 50000 --rpc --rpcaddr 0.0.0.0 --rpcport 22000 --rpcapi admin,db,eth,debug,miner,net,shh,txpool,personal,web3,quorum,raft --emitcheckpoints --port 21000 --allow-insecure-unlock >> node1.log 2>&1 &
    ```

    ```
    vim startnode2.sh
    ```

    Script to start node two:
    ```
    #!/bin/bash
    PRIVATE_CONFIG=/Users/celia/path/to/quorum-raft-diamond/tessera/node-2t/tm.ipc nohup geth --datadir /Users/celia/path/to/quorum-raft-diamond/quorum/node-2 --nodiscover --verbosity 5 --networkid 31337 --raft --raftport 50001 --raftjoinexisting 2 --rpc --rpcaddr 0.0.0.0 --rpcport 22001 --rpcapi admin,db,eth,debug,miner,net,shh,txpool,personal,web3,quorum,raft --emitcheckpoints --port 21001 --allow-insecure-unlock >> node2.log 2>&1 &
    ```

    ```
    vim startnode3.sh
    ```

    Script to start node three:
    ```
    #!/bin/bash
    PRIVATE_CONFIG=/Users/celia/path/to/quorum-raft-diamond/tessera/node-3t/tm.ipc nohup geth --datadir /Users/celia/path/to/quorum-raft-diamond/quorum/node-3 --nodiscover --verbosity 5 --networkid 31337 --raft --raftport 50002 --raftjoinexisting 3 --rpc --rpcaddr 0.0.0.0 --rpcport 22002 --rpcapi admin,db,eth,debug,miner,net,shh,txpool,personal,web3,quorum,raft --emitcheckpoints --port 21002 --allow-insecure-unlock >> node3.log 2>&1 &
    ```

    Note: We need to add a flag `--allow-insecure-unlock` since unlocking accounts with HTTP access is not allowed. This option is for testing purposes only.

###### Tessera
1. Create a directory for Tessera nodes.
    ```
    cd ..
    mkdir tessera
    ```

2. 
    ```
    cd tessera
    ```

    Download the Tessera jar file from https://github.com/ConsenSys/tessera/releases/ and rename it as `tessera.jar`, or download using curl.
    ```
    curl https://oss.sonatype.org/service/local/repositories/releases/content/net/consensys/quorum/tessera/tessera-app/20.10.0/tessera-app-20.10.0-app.jar -o tessera.jar
    ```

3. Create Tessera node directories.
    ```
    mkdir node-1t
    mkdir node-2t
    mkdir node-3t
    ```

4. Generate a key pair for each node.
    ```
    cd node-1t
    java -jar ../tessera.jar -keygen -filename node-1
    cd ../node-2t
    java -jar ../tessera.jar -keygen -filename node-2
    cd ../node-3t
    java -jar ../tessera.jar -keygen -filename node-3
    ```

    Note: For testing purposes, you could leave the password blank when generating keys.
    &nbsp;

5. Create a `config.json` file in each node directory.
    ```
    cd ../node-1t
    vim config.json
    ```

    Configuration for node one:
    ```
    {
        "useWhiteList": false,
        "jdbc": {
            "username": "sa",
            "password": "",
            "url": "jdbc:h2:/Users/celia/path/to/quorum-raft-diamond/tessera/node-1t/db1;MODE=Oracle;TRACE_LEVEL_SYSTEM_OUT=0",
            "autoCreateTables": true
        },
        "serverConfigs":[
            {
                "app":"ThirdParty",
                "enabled": true,
                "serverAddress": "http://localhost:9081",
                "communicationType" : "REST"
            },
            {
                "app":"Q2T",
                "enabled": true,
                "serverAddress":"unix:/Users/celia/path/to/quorum-raft-diamond/tessera/node-1t/tm.ipc",
                "communicationType" : "REST"
            },
            {
                "app":"P2P",
                "enabled": true,
                "serverAddress":"http://localhost:9001",
                "sslConfig": {
                    "tls": "OFF"
                },
                "communicationType" : "REST"
            }
        ],
        "peer": [
            {
                "url": "http://localhost:9001"
            },
            {
                "url": "http://localhost:9003"
            },
            {
                "url": "http://localhost:9005"
            }
        ],
        "keys": {
            "passwords": [],
            "keyData": [
                {
                    "privateKeyPath": "/Users/celia/path/to/quorum-raft-diamond/tessera/node-1t/node-1.key",
                    "publicKeyPath": "/Users/celia/path/to/quorum-raft-diamond/tessera/node-1t/node-1.pub"
                }
            ]
        },
        "alwaysSendTo": []
    }
    ```

    ```
    cd ../node-2t
    vim config.json
    ```

    Configuration for node two:
    ```
    {
        "useWhiteList": false,
        "jdbc": {
            "username": "sa",
            "password": "",
            "url": "jdbc:h2:/Users/celia/path/to/quorum-raft-diamond/tessera/node-2t/db1;MODE=Oracle;TRACE_LEVEL_SYSTEM_OUT=0",
            "autoCreateTables": true
        },
        "serverConfigs":[
            {
                "app":"ThirdParty",
                "enabled": true,
                "serverAddress": "http://localhost:9083",
                "communicationType" : "REST"
            },
            {
                "app":"Q2T",
                "enabled": true,
                "serverAddress":"unix:/Users/celia/path/to/quorum-raft-diamond/tessera/node-2t/tm.ipc",
                "communicationType" : "REST"
            },
            {
                "app":"P2P",
                "enabled": true,
                "serverAddress":"http://localhost:9003",
                "sslConfig": {
                    "tls": "OFF"
                },
                "communicationType" : "REST"
            }
        ],
        "peer": [
            {
                "url": "http://localhost:9001"
            },
            {
                "url": "http://localhost:9003"
            },
            {
                "url": "http://localhost:9005"
            }
        ],
        "keys": {
            "passwords": [],
            "keyData": [
                {
                    "privateKeyPath": "/Users/celia/path/to/quorum-raft-diamond/tessera/node-2t/node-2.key",
                    "publicKeyPath": "/Users/celia/path/to/quorum-raft-diamond/tessera/node-2t/node-2.pub"
                }
            ]
        },
        "alwaysSendTo": []
    }
    ```

    ```
    cd ../node-3t
    vim config.json
    ```

    Configuration for node three:
    ```
    {
        "useWhiteList": false,
        "jdbc": {
            "username": "sa",
            "password": "",
            "url": "jdbc:h2:/Users/celia/path/to/quorum-raft-diamond/tessera/node-3t/db1;MODE=Oracle;TRACE_LEVEL_SYSTEM_OUT=0",
            "autoCreateTables": true
        },
        "serverConfigs":[
            {
                "app":"ThirdParty",
                "enabled": true,
                "serverAddress": "http://localhost:9085",
                "communicationType" : "REST"
            },
            {
                "app":"Q2T",
                "enabled": true,
                "serverAddress":"unix:/Users/celia/path/to/quorum-raft-diamond/tessera/node-3t/tm.ipc",
                "communicationType" : "REST"
            },
            {
                "app":"P2P",
                "enabled": true,
                "serverAddress":"http://localhost:9005",
                "sslConfig": {
                    "tls": "OFF"
                },
                "communicationType" : "REST"
            }
        ],
        "peer": [
            {
                "url": "http://localhost:9001"
            },
            {
                "url": "http://localhost:9003"
            },
            {
                "url": "http://localhost:9005"
            }
        ],
        "keys": {
            "passwords": [],
            "keyData": [
                {
                    "privateKeyPath": "/Users/celia/path/to/quorum-raft-diamond/tessera/node-3t/node-3.key",
                    "publicKeyPath": "/Users/celia/path/to/quorum-raft-diamond/tessera/node-3t/node-3.pub"
                }
            ]
        },
        "alwaysSendTo": []
    }
    ```

### Structure
The main structure of this project looks like this.
```
.
├── contracts
│   ├── Diamond.sol
│   └── Migrations.sol
├── migrations
│   ├── 1_initial_migration.js
│   └── 2_deploy_contract.js
├── quorum
│   ├── genesis.json
│   ├── node-1
│   │   ├── keystore
│   │   ├── nodekey
│   │   └── static-nodes.json
│   ├── node-2
│   │   ├── keystore
│   │   ├── nodekey2
│   │   └── static-nodes.json
│   ├── node-3
│   │   ├── keystore
│   │   ├── nodekey3
│   │   └── static-nodes.json
│   ├── startnode1.sh
│   ├── startnode2.sh
│   └── startnode3.sh
├── tessera
│   ├── node-1t
│   │   ├── config.json
│   │   ├── node-1.key
│   │   └── node-1.pub
│   ├── node-2t
│   │   ├── config.json
│   │   ├── node-2.key
│   │   └── node-2.pub
│   ├── node-3t
│   │   ├── config.json
│   │   ├── node-3.key
│   │   └── node-3.pub
│   └── tessera.jar
├── test
│   ├── Diamond-node1.js
│   ├── Diamond-node2.js
│   ├── Diamond-node3.js
│   └── helper.js
└── truffle-config.js
```

### Get Started
1. Change current directory to `/quorum-raft-diamond/tessera` and start Tessera nodes.
    ```
    java -jar tessera.jar -configfile node-1t/config.json >> node-1t/node1t.log 2>&1 &
    java -jar tessera.jar -configfile node-2t/config.json >> node-2t/node2t.log 2>&1 &
    java -jar tessera.jar -configfile node-3t/config.json >> node-3t/node3t.log 2>&1 &
    ```

2. Change current directory to `/quorum-raft-diamond/quorum` and start Quorum nodes.
    ```
    ./startnode1.sh
    ./startnode2.sh
    ./startnode3.sh
    ```

3. Attach geth to the Quorum node,
    ```
    geth attach node-1/geth.ipc
    ```
    and unlock the account like this.
    ```
    personal.unlockAccount("0xf9a805bCDe6a343997AF88bd4cF4379f6c0f6e66");
    ```

### Configuration
The Truffle configuration file `truffle-config.js` specifies the Quorum network we are connecting to.

### Deployment
1. Compile the smart contracts.
    ```
    truffle compile
    ```

2. Deploy the smart contracts.
    ```
    truffle migrate
    ```

    To enable private access to a contract, use the `privateFor` parameter and add the public keys of the target parties to it. For example:
    ```
    deployer.deploy(Diamond, {
        privateFor: [
            'PuVWL5epvJVyJx+IKlkKhFn43aYwi7Z4h5Av4bRcpy0=',
            'piVBvmX3ZC0/MgreH2M/SPXVja9RGH/5YPY8ITkd1QI='
        ]
    });
    ```
    
    In this project, node one and node two are the parties privy to the `Diamond` contract.
    &nbsp;
    
    Note: If you receive `Error: authentication needed: password or unlock` when migrating or testing the contract, try to unlock the accounts.

### Testing
Run test cases using development or node one network.
```
truffle exec test/Diamond-node1.js
```
Run test cases using node two network.
```
truffle exec test/Diamond-node2.js --network nodeTwo
```
Run test cases using node three network.
```
truffle exec test/Diamond-node3.js --network nodeThree
```