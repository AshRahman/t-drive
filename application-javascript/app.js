

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
			const express=require('express');
			const cookieParser =require('cookie-parser');
			const fileUpload = require('express-fileupload');
			const path = require('path');
			let app=express();
			const PORT=3600;

			app.use(cookieParser());
			app.use(express.urlencoded({ extended: false }));
			app.use(express.json());

			app.use(fileUpload({
				useTempFiles : true,
				tempFileDir : 'tmp/',
				createParentPath:true
			}));

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
				const key = `user_${email}`;

				try {
					let result= await contract.evaluateTransaction('CreateUser', key, email, password, name);

					await contract.submitTransaction('CreateUser', key, email,password, name);
					res.send(result.toString());
				} catch (error) {
					res.status(400).send(error.toString());
				}

			});

			app.post('/login',async function(req, res){
				const {email,password} =req.body;
				try {
					let result= await contract.evaluateTransaction('FindUser', email, password);

					res.cookie('user',result,{maxAge: 9000000, httpOnly: true});
					res.send(result.toString());
				} catch (error) {
					res.status(400).send(error.toString());
				}

			});

			app.get('/logout',async function(req, res){
				try {
					res.cookie('user',null,{maxAge: 9000000, httpOnly: true});
					res.send("Logged out Successfully");
				} catch (error) {
					res.status(400).send(error.toString());
				}

			});

			app.post('/file',async function(req, res){

				const key = null;
				const uploaderEmail = req.cookies.user.Email;


				if (req.cookies.user === null){
					res.status(400).send("You are not logged in");
					return;
				}
				console.log(req.files.uploadedFile);
				const uploadedFile =req.files.uploadedFile;
				if(uploadedFile == undefined){
					res.status(400).send("you must upload a file");
					return;
				}
				const fileName = uploadedFile.name;
				const fileDestiantion= path.join('public','uploadedFiles',fileName);
				uploadedFile.mv(fileDestiantion,(err) => {
					if(err != undefined){
						res.status(500).send(`Server error failed to move file ${err}`);
						return;
					}
					const downloadLink =path.join(fileDestiantion, fileName);
					console.log(downloadLink);

					res.send(req.files.uploadedFile);

				});


				// try {

				// 	let result= await contract.evaluateTransaction('CreateFile',key,fileName,downloadLink,fileHash,uploaderEmail);
				// 	await contract.submitTransaction('CreateFile',key,fileName,downloadLink,fileHash,uploaderEmail);

				// 	res.cookie('user',result,{maxAge: 9000000, httpOnly: true});
				// 	res.send(result.toString());
				// } catch (error) {
				// 	res.status(400).send(error.toString());
				// }

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
