const express = require('express');
const { ethers } = require('ethers');
const config = require('./config');
const { resolveProperties } = require('ethers/lib/utils');
const cors = require('cors');

const app = express();
const PORT = config.PORT;
app.use(cors());
app.use(express.json());

app.get('/createAccount', async (request, response) => {

    const wallet = ethers.Wallet.createRandom();

    console.log('address:', wallet.address)
    console.log('mnemonic:', wallet.mnemonic.phrase)
    console.log('privateKey:', wallet.privateKey)

    let newWallet = {
        "Mnemonic": wallet.mnemonic.phrase.toString(),
        "Address": wallet.address.toString(),
        "PrivateKey": wallet.privateKey.toString()
    }

    response.send(newWallet);
});

app.post('/mainToken/balance', async (request, response) => {
    let rpc = request.query.RPC;
    let address = request.query.address;
    console.log(rpc, address);

    EthersBalance = await connectToNetwork(rpc, address);

    let networkDetails = {
        "balance": EthersBalance
    };
    response.send(networkDetails);
});

app.post('/importToken', async (request, response) => {

    let rpc = request.query.RPC;
    let address = request.query.address;
    let contractId = request.query.contractAddress;
    let contractABI = request.query.contractAbi;


    result = await connectToken(rpc, address, contractId, contractABI);

    response.send(result);

});


app.post('/token/balance', async (request, response) => {

    let rpc = request.query.RPC;
    let address = request.query.address;
    let contractId = request.query.contractAddress;
    let contractABI = request.query.contractAbi;


    result = await TokenBalance(rpc, address, contractId, contractABI);

    response.send(result);

});

app.post('/account/mnemonic', async (request, response) => {

    let mnemonic = request.query.Mnemonic;

    result = await generateAccountFromMnemonic(mnemonic);

    response.send(result);

});


app.post('/transfer/mainToken', async (request, response) => {
    let rpc = request.query.RPC;
    let receiver = request.query.Receiver;
    let privateKey = request.query.PrivateKey;
    let amount = request.query.Amount;

    result = await EtherTransfer(rpc, receiver, privateKey, amount);

    response.send(result);
})

app.post("/change-network", async (request, response) => {
    let rpc = request.query.RPC;
    let chainId = request.query.ChainId;

    result = await ChangeNetwork(rpc, chainId);
    response.send(result);
})

async function ChangeNetwork(rpc, chainId) {
    const provider = new ethers.providers.JsonRpcProvider(rpc);

    let objectNetwork = await provider.getNetwork();
    // returns a bigint
    let chainID = parseInt(objectNetwork.chainId.toString());
    if (chainID == chainId) {
        result = {
            "message": "Success"
        }
    }

    else {
        result = {
            "message": "Failure"
        }
    }

    return result;
}

async function EtherTransfer(rpc, receiver, privateKey, amount) {
    const provider = ethers.getDefaultProvider(rpc);

    let txHash = ''
    let Status = ''

    let signer = new ethers.Wallet(privateKey, provider)

    const tx = {
        to: receiver,
        value: ethers.utils.parseEther(amount.toString())
    };

    await signer.sendTransaction(tx).then((txObj) => {
        console.log(txObj);
        txHash = txObj.hash.toString();
        Status = "Success"
        console.log(txObj.hash);
    })
    result = {
        "Status": Status,
        "TxHash": txHash
    }


    return result;

}

function generateAccountFromMnemonic(mnemonic) {
    // Create a wallet instance from the provided mnemonic
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);

    // Retrieve the Ethereum address and private key
    const address = wallet.address;
    const privateKey = wallet.privateKey;

    result = {
        "Mnemonic": mnemonic,
        "Address": address,
        "PrivateKey": privateKey
    }

    return result;
}

async function TokenBalance(url, accountAddress, contractId, abi) {

    const provider = new ethers.providers.JsonRpcProvider(url);

    myContract_read = new ethers.Contract(contractId, abi, provider)  // Read only

    await myContract_read.balanceOf(accountAddress).then((result) => {
        hexNumber = result._hex;
        decimalNumber = BigInt(hexNumber);
        tokenValue = (decimalNumber / BigInt(10 ** 18)).toString();
    })

    result = {
        "TokenBalance": tokenValue
    }

    return result;
}





async function connectToken(url, accountAddress, contractId, abi) {

    const provider = new ethers.providers.JsonRpcProvider(url);

    myContract_read = new ethers.Contract(contractId, abi, provider)  // Read only

    await myContract_read.name().then((result) => {
        tokenName = result.toString();
    })
    await myContract_read.symbol().then((result) => {
        tokenSymbol = result.toString();
    })
    await myContract_read.decimals().then((result) => {
        tokenDecimals = result.toString();
    })
    await myContract_read.balanceOf(accountAddress).then((result) => {
        hexNumber = result._hex;
        decimalNumber = BigInt(hexNumber);
        tokenValue = (decimalNumber / BigInt(10 ** 18)).toString();
    })

    result = {
        "TokenName": tokenName,
        "TokenSymbol": tokenSymbol,
        "TokenDecimals": tokenDecimals,
        "TokenBalance": tokenValue
    }

    return result;
}


async function connectToNetwork(url, accountAddress) {

    const provider = new ethers.providers.JsonRpcProvider(url);

    balance = await provider.getBalance(accountAddress);
    balanceInEthers = await ethers.utils.formatEther(balance);
    console.log(`balance in ethers = ${balanceInEthers}`);

    return balanceInEthers.toString();
}





app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});




