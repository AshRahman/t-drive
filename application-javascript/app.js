

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel';
const chaincodeName = 'tdrive4';
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
			const express=require('express');
			const cookieParser =require('cookie-parser');
			const fileUpload = require('express-fileupload');
			const crypto = require('crypto');
			const fs = require('fs');
			const path = require('path');
			const util =require('util');


			let app=express();
			const PORT=3000;

			app.use(cookieParser());
			app.use(express.urlencoded({ extended: false }));
			app.use(express.json());
			app.use(express.static('public'));

			app.use(fileUpload({
				useTempFiles : true,
				tempFileDir : 'tmp/',
				createParentPath:true
			}));

			//API calls

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

					res.cookie('user',result.toString(),{maxAge: 9000000, httpOnly: true});
					res.send(result.toString());
				} catch (error) {
					res.status(400).send(error.toString());
				}

			});

			app.get('/logout',async function(req, res){
				try {
					res.cookie('user','',{maxAge: -1, httpOnly: true});
					res.send('Logged out Successfully');
				} catch (error) {
					res.status(400).send(error.toString());
				}

			});

			//Function for sha256 for file hash
			// eslint-disable-next-line no-inner-declarations
			async function sha256(filePath){
				const readFile =util.promisify(fs.readFile);

				const hash = crypto.createHash('sha256');
				const data = await readFile(filePath);
				hash.update(data);

				return hash.digest('base64');
			}
			app.post('/file',async function(req, res){
				if (req.cookies.user == null){
					res.status(400).send('You are not logged in');
					return;
				}

				console.log(req.files.uploadedFile);
				const uploadedFile =req.files.uploadedFile;
				if(uploadedFile == undefined){
					res.status(400).send('you must upload a file');
					return;
				}
				const fileName = uploadedFile.name;
				const fileDestiantion= path.join('public','uploadedFiles',fileName);
				uploadedFile.mv(fileDestiantion,async (err) => {
					if(err !== undefined){
						res.status(500).send(`Server error failed to move file ${err}`);
						return;
					}


					try {
						const user =JSON.parse(req.cookies.user.toString());
						const downloadLink =path.join('public','uploadedFiles', fileName);
						const uploaderEmail = user.Email;
						const key =`file_${uploaderEmail}_${fileName}`;

						///Create Hash
						const fileHash =await sha256(fileDestiantion);
						let result= await contract.evaluateTransaction('CreateFile',key,fileName,downloadLink,fileHash,uploaderEmail);
						await contract.submitTransaction('CreateFile',key,fileName,downloadLink,fileHash,uploaderEmail);
						//res.cookie('user',result,{maxAge: 9000000, httpOnly: true});
						console.log(result.toString());
						res.send(result.toString());
					} catch (error) {
						res.status(400).send(error.toString());
					}

				});

			});

			app.get('/file', async function(req, res){
				if (req.cookies.user == null){
					res.status(400).send('You are not logged in');
					return;
				}
				try{
					const user =JSON.parse(req.cookies.user.toString());
					let result= await contract.evaluateTransaction(
						'FindFileByUser',
						user.Email,
					);

					res.send(result.toString());

				}catch(err){
					res.send(400).send(err.toString());
				}

			});

			app.get('/file/:fileKey', async function(req, res){
				if (req.cookies.user == null){
					res.status(400).send('You are not logged in');
					return;
				}

				const fileKey= req.params.fileKey;
				try{
					const user =JSON.parse(req.cookies.user.toString());
					let result= await contract.evaluateTransaction(
						'FindFile',
						fileKey,
					);
					const uploadedFile =JSON.parse(result);


					result= await contract.evaluateTransaction(
						'FindFileShareWithUser',
						user.Email,
					);
					let filesSharedWithMe= JSON.parse(result);
					filesSharedWithMe= filesSharedWithMe.map(data=> data.Record);
					console.log(filesSharedWithMe);

					const thisFileSharedWithMe =filesSharedWithMe.some(fileShare =>fileShare.FileKey == uploadedFile.Key);

					if(uploadedFile.UploaderEmail != user.Email && !thisFileSharedWithMe){
						res.status(403).send("You're not authorised to view this file");
					}else{
						res.send(JSON.stringify(uploadedFile));
					}
				}catch(err){
					res.status(400).send(err.toString());
				}

			});

			app.put('/file/:fileKey', async function(req, res){
				if (req.cookies.user == null){
					res.status(400).send('You are not logged in');
					return;
				}

				const fileKey= req.params.fileKey;
				try{
					const user =JSON.parse(req.cookies.user.toString());
					let result= await contract.evaluateTransaction(
						'FindFile',
						fileKey,
					);

					const uploadedFile =JSON.parse(result);
					const newFileName = req.body.newFileName;

					if(uploadedFile.UploaderEmail !== user.Email){
						res.status(403).send("You're not authorised to update this file");
					}else{

						///move file and update download link
						const renameFile = util.promisify(fs.rename);

						const srcPath = uploadedFile.DownloadLink;//path.join('public',uploadedFile.DownloadLink);
						const destinationPath =path.join('public','uploadedFiles',newFileName);
						const err = await renameFile(srcPath, destinationPath);

						const newDownloadLink = path.join('uploadedFiles',newFileName);
						console.log(newDownloadLink);
						if(err != undefined) {
							res.status(500).send(`Server Error ${err}`);
							return;
						}

						let result= await contract.evaluateTransaction('ChangeFileName', fileKey,newFileName,newDownloadLink);
						await contract.submitTransaction('ChangeFileName', fileKey,newFileName,newDownloadLink);
						res.send(result.toString());
					}
				}catch(err){
					res.status(400).send(err.toString());
				}

			});

			app.delete('/file/:fileKey', async function(req, res){
				if (req.cookies.user == null){
					res.status(400).send('You are not logged in');
					return;
				}

				const fileKey= req.params.fileKey;
				try{
					const user =JSON.parse(req.cookies.user.toString());
					let result= await contract.evaluateTransaction(
						'FindFile',
						fileKey,
					);

					const uploadedFile =JSON.parse(result);

					if(uploadedFile.UploaderEmail !== user.Email){
						res.status(403).send("You're not authorised to delete this file");
					}else{

						///delete file and update download link
						const deleteFile = util.promisify(fs.unlink);

						const srcPath = path.join('public',uploadedFile.DownloadLink);
						const err = await deleteFile(srcPath);

						if(err != undefined) {
							res.status(500).send(`Server Error ${err}`);
							return;
						}

						let result= await contract.evaluateTransaction('DeleteFile', fileKey);
						await contract.submitTransaction('DeleteFile', fileKey);
						res.send(result.toString());
					}
				}catch(err){
					res.status(400).send(err.toString());
				}

			});
			app.post('/fileShare',async function(req, res){
				const {fileKey,sharedWithEmail} =req.body;
				const key = `fileShare_${fileKey}_${sharedWithEmail}`;

				try {
					let result= await contract.evaluateTransaction('ShareFile', key, fileKey,sharedWithEmail);

					await contract.submitTransaction('ShareFile', key, fileKey,sharedWithEmail);
					res.send(result.toString());
				} catch (error) {
					res.status(400).send(error.toString());
				}

			});
			app.get('/fileShare/byFile/:fileKey', async function(req, res){
				if (req.cookies.user == null){
					res.status(400).send('You are not logged in');
					return;
				}

				const fileKey= req.params.fileKey;
				try{
					const user =JSON.parse(req.cookies.user.toString());
					let result= await contract.evaluateTransaction(
						'FindFile',
						fileKey,
					);
					const uploadedFile =JSON.parse(result);
					if(uploadedFile.UploaderEmail !== user.Email){
						res.status(403).send("You're not authoreised to view this file");
					}else{
						let result= await contract.evaluateTransaction(
							'FindFileShareByFile',
							fileKey,
						);
						res.send(result.toString());
					}
				}catch(err){
					res.status(400).send(err.toString());
				}

			});

			app.get('/fileShare/withMe', async function(req, res){
				if (req.cookies.user == null){
					res.status(400).send('You are not logged in');
					return;
				}

				try{
					const user =JSON.parse(req.cookies.user.toString());
					let result= await contract.evaluateTransaction(
						'FindFileShareWithUser',
						user.Email,
					);
					res.send(result.toString());
				}catch(err){
					res.send(400).send(err.toString());
				}

			});
			app.delete('/fileShare/:fileShareKey', async function(req, res){
				if (req.cookies.user == null){
					res.status(400).send('You are not logged in');
					return;
				}

				const fileShareKey= req.params.fileShareKey;
				try{
					const user =JSON.parse(req.cookies.user.toString());
					let result= await contract.evaluateTransaction(
						'FindFileShare',
						fileShareKey,
					);

					const fileShare =JSON.parse(result);
					const fileKey = fileShare.FileKey;
					result = await contract.evaluateTransaction(
						'FindFile',
						fileKey,
					);
					
					const uploadedFile =JSON.parse(result);

					if(uploadedFile.UploaderEmail != user.Email && fileShare.SharedWithEmail != user.Email){
						res.status(403).send("You're not authorised to delete this file");
					}else{

						let result= await contract.evaluateTransaction('DeleteFileShare', fileShareKey);
						await contract.submitTransaction('DeleteFileShare', fileShareKey);
						res.send(result.toString());
					}
				}catch(err){
					res.status(400).send(err.toString());
				}

			});

			let server=app.listen(PORT,function() {
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
