

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel';
const chaincodeName = 'tdrive1';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}


async function main() {
	try {
		// build an in memory object with the network configuration (also known as a connection profile)
		const ccp = buildCCPOrg1();

		// build an instance of the fabric ca services client based on
		// the information in the network configuration
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

		// setup the wallet to hold the credentials of the application user
		const wallet = await buildWallet(Wallets, walletPath);

		// in a real application this would be done on an administrative flow, and only once
		await enrollAdmin(caClient, wallet, mspOrg1);

		// in a real application this would be done only when a new user was required to be added
		// and would be part of an administrative flow
		await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

		// Create a new gateway instance for interacting with the fabric network.
		// In a real application this would be done as the backend server session is setup for
		// a user that has been verified.
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true }
			});

			const network = await gateway.getNetwork(channelName);

			const contract = network.getContract(chaincodeName);


			/////////////////////////////////////////////////////////
			//create server
			let express=require('express');

			let app=express();
			const PORT=3600;

			app.use(express.urlencoded({ extended: false }));
			app.use(express.json());

			app.get('/',function(req,res)
			{
				res.send('Welcome to T-drive');
			});

			app.get('/book',function(req,res)
			{
				res.send('Hello Book Readers hello!');
			});

			app.post('/register',async function(req, res){
				const {email,password,name} =req.body;
				key = `user_${email}`;

				let result = await contract.evaluateTransaction('GetAllAssets');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);
			try {
				let result= await contract.evaluateTransaction('CreateUser', 
				key, 
				email, 
				password, 
				name);

				await contract.submitTransaction('CreateUser', 
				key, 
				email, 
				password, 
				name);
				res.send(result.toString());
			} catch (error) {
				res.error(error.toString());
			}

			});

			var server=app.listen(PORT,function() {
				console.log(`Server listening port http://localhost:${PORT}`);
			});
			

		} finally {
			//gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
}

main();
