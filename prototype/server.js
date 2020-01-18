// ExpressJS Setup
const express = require('express');
const app = express();
var bodyParser = require('body-parser');

// Hyperledger Bridge
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve(__dirname, '..', 'network' ,'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// use static file
app.use(express.static(path.join(__dirname, 'views')));

// configure app to use body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// main page routing
app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/index.html');
})

async function cc_call(fn_name, args){
    
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);

    const userExists = await wallet.exists('user1');
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('labeld');

    var result;
    
    if(fn_name == 'addDataset')
        result = await contract.submitTransaction('addDataset', args);
    else if( fn_name == 'addTask')
    {
        dID=args[0];
        iID=args[1];
        uID=args[2];
        day=args[3];
        result = await contract.submitTransaction('addTask', dID, iID, uID,day);
    }
    else if(fn_name == 'readDataset')
        result = await contract.evaluateTransaction('readDataset', args);
    else
        result = 'not supported function'

    return result;
}

// create mate
app.post('/addDataset', async(req, res)=>{
    const dataid = req.body.datasetID;
    console.log("add dataset: " + dataid);

    result = cc_call('addDataset', dataid)

    const myobj = {result: "success"}
    res.status(200).json(myobj) 
})

// add score
app.post('/addTask', async(req, res)=>{
    const dataid = req.body.datasetID;
    const imageid = req.body.imageID;
    const userid = req.body.userID;
    const date = req.body.date;
    console.log("DataSetID is: " + dataid);
    console.log("add image: " + imageid);
    console.log("add userId " + userid);
    console.log("Date " + date);

    var args=[dataid,imageid,userid,date];
    result = cc_call('addTask', args)

    const myobj = {result: "success"}
    res.status(200).json(myobj) 
})

app.post('/readDataset/:dataid', async (req,res)=>{
    const dataid = req.body.datasetID;
    console.log("DataSetID: " + req.body.datasetID);
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists('user1');
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('labeld');
    const result = await contract.evaluateTransaction('readDataset', dataid);
    const myobj = JSON.parse(result)
    res.status(200).json(myobj)
});

// server start
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);