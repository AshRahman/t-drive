

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
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);

			// Initialize a set of asset data on the channel using the chaincode 'InitLedger' function.
			// This type of transaction would only be run once by an application the first time it was started after it
			// deployed the first time. Any updates to the chaincode deployed later would likely not need to run
			// an "init" type function.


			// Let's try a query type operation (function).
			// This will be sent to just one peer and the results will be shown.

			let result = await contract.evaluateTransaction('GetAllAssets');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);
			try {
				let result= await contract.evaluateTransaction('CreateUser', 'user_rockashfaq0@outlook.com', 'rockashfaq0@outlook.com', 'Ashfaq123', 'Ashfaqur Rahman');

				await contract.submitTransaction('CreateUser', 'user_rockashfaq0@outlook.com', 'rockashfaq0@outlook.com', 'Ashfaq123', 'Ashfaqur Rahman');
				console.log(`User Creation success\n Result: ${result}`);
			} catch (error) {
				console.log(`*** Successfully caught the error: \n    ${error}\n`);
			}

			try {
				let result= await contract.evaluateTransaction('CreateUser', 'user_rockashfaq0@gmail.com', 'rockashfaq0@gmail.com', 'Ashfaq1234', 'Ashfaqur Rahman Rahat');

				await contract.submitTransaction('CreateUser', 'user_rockashfaq0@gmail.com', 'rockashfaq0@gmail.com', 'Ashfaq1234', 'Ashfaqur Rahman Rahat');
				console.log(`User Creation success\n Result: ${result}`);
			} catch (error) {
				console.log(`*** Successfully caught the error: \n    ${error}\n`);
			}



			try {
				let result= await contract.evaluateTransaction('FindUser', 'rockashfaq0@outlook.com', 'Ashfaq123');
				console.log(`User Found\n Result: ${result}`);
			} catch (error) {
				console.log(`*** Successfully caught the Error: \n    ${error}\n`);
			}
			// try {
			// 	let result= await contract.evaluateTransaction('FindUser', 'rockashfaq0@outlook.com', '123');
			// 	console.log(`User Found\n Result: ${result}`);
			// } catch (error) {
			// 	console.log(`*** error: \n    ${error}`);
			// }
			try {
				let result= await contract.evaluateTransaction('CreateFile',
					'file_cert.txt_hash123',
					'cert.txt',
					'/files/cert.txt',
					'hash123',
					'rockashfaq0@outlook.com'
				);
				await contract.submitTransaction('CreateFile',
					'file_cert.txt_hash123', 
					'cert.txt',
					'/files/cert.txt',
					'hash123',
					'rockashfaq0@outlook.com'
				);


				console.log(`File Created\n Result: ${result}\n`);
			} catch (error) {
				console.log(`*** Successfully caught the Error: \n    ${error}\n`);
			}

			try {
				let result= await contract.evaluateTransaction('CreateFile',
					'file_letter.txt_hash567',
					'letter.txt',
					'/files/letter.txt',
					'hash567',
					'rockashfaq0@outlook.com'
				);
				await contract.submitTransaction('CreateFile',
					'file_letter.txt_hash567', 
					'letter.txt',
					'/files/letter.txt',
					'hash567',
					'rockashfaq0@outlook.com'
				);


				console.log(`File Created\n Result: ${result}\n`);
			} catch (error) {
				console.log(`*** Successfully caught the Error: \n    ${error}\n`);
			}
			//CreateFile(ctx, key, name, downloadLink, fileHash, uploaderEmail)

			try {
				let result= await contract.evaluateTransaction(
					'FindFile',
					'file_cert.txt_hash123',
				);


				console.log(`File found\n Result: ${result}\n`);
			} catch (error) {
				console.log(`*** Successfully caught the Error: \n    ${error}\n`);
			}


			try {
				let result= await contract.evaluateTransaction(
				'ChangeFileName',
				 'file_cert.txt_hash123', 
				 'cert_new.txt',
				 );
				 await contract.submitTransaction('ChangeFileName',
				 'file_cert.txt_hash123', 
				 'cert_new.txt',
				 
				 );


				console.log(`Name Changed\n Result: ${result}\n`);
			} catch (error) {
				console.log(`*** Successfully caught the Error: \n    ${error}\n`);
			}

			// try {
			// 	let result= await contract.evaluateTransaction(
			// 	 'DeleteFile',
			// 	 'file_letter.txt_hash567', 
			// 	 );
			// 	 await contract.submitTransaction(
			// 	 'DeleteFile',
			// 	 'file_letter.txt_hash567', 			 
			// 	 );


			// 	console.log(`File Deleted\n Result: ${result}\n`);
			// } catch (error) {
			// 	console.log(`*** Successfully caught the Error: \n    ${error}\n`);
			// }
			// {
			// 	"selector": {
			// 	   "UploaderEmail": "rockashfaq0@outlook.com",
			// 	   "DocType": "file"
			// 	}
			//  }
			try {
				let result= await contract.evaluateTransaction(
					'FindFileByUser',
					'rockashfaq0@outlook.com',
				);

				console.log(`File found by email\n Result: ${result}\n`);
			} catch (error) {
				console.log(`*** Successfully caught the Error: \n    ${error}\n`);
			}
			try {
				let result= await contract.evaluateTransaction(
				'ShareFile',
				 'fileSharecert.txt_hash123', 
				 'file_cert.txt_hash123',
				 'rockashfaq0@gmail.com'
				 );
				 await contract.submitTransaction(
				'ShareFile',
				 'fileShare_cert.txt_hash123', 
				 'file_cert.txt_hash123',
				 'rockashfaq0@gmail.com'
				 );


				console.log(`File Shared\n Result: ${result}\n`);
			} catch (error) {
				console.log(`*** Successfully caught the Error: \n    ${error}\n`);
			}

			try {
				let result= await contract.evaluateTransaction(
				'ShareFile',
				 'fileShareletter.txt_hash567', 
				 'file_letter.txt_hash567',
				 'rockashfaq0@gmail.com'
				 );
				 await contract.submitTransaction(
				'ShareFile',
				 'fileShare_letter.txt_hash567', 
				 'file_letter.txt_hash567',
				 'rockashfaq0@gmail.com'
				 );


				console.log(`File Shared\n Result: ${result}\n`);
			} catch (error) {
				console.log(`*** Successfully caught the Error: \n    ${error}\n`);
			}
			try {
				let result= await contract.evaluateTransaction(
				'FindFileShareByFile',
				 'file_letter.txt_hash567',
				 );


				console.log(`File Shared by file\n Result: ${result}\n`);
			} catch (error) {
				console.log(`*** Successfully caught the Error: \n    ${error}\n`);
			}

			try {
				let result= await contract.evaluateTransaction(
					'FindFileShareByUser',
					email,
				);


				console.log(`File Shared list\n Result: ${result}\n`);
			} catch (error) {
				console.log(`*** Successfully caught the Error: \n    ${error}\n`);
			}

			try {
				let result= await contract.evaluateTransaction(
				'DeleteFileShare',
				 'fileShare_letter.txt_hash567',
				 );
				 await contract.submitTransaction(
				'DeleteFileShare',
				 'fileShare_letter.txt_hash567',
				 );


				console.log(`File Shared deleted\n Result: ${result}\n`);
			} catch (error) {
				console.log(`*** Successfully caught the Error: \n    ${error}\n`);
			}

		} finally {
			// Disconnect from the gateway when the application is closing
			// This will close all connections to the network
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
}

main();
