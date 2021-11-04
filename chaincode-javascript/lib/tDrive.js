
'use strict';

// Deterministic JSON.stringify()
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class TDrive extends Contract {

    //User creation
    async CreateUser(ctx, key, email, password, name){
        const user = {
            Key: key,
            Email: email,
            Password: password,
            Name: name,
            Doctype: 'user',
        };
        //we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(user)));
        return JSON.stringify(user);
    }

    // ReadAsset returns the asset stored in the world state with given id.
    async ReadAsset(ctx, id) {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    //Find Users
    async FindUser(ctx, email, password) {
        const key = `user_${email}`;
        const userJSON = await ctx.stub.getState(key);
        if (!userJSON || userJSON.length === 0) {
            throw new Error(`The user with email ${email} does not exist`);
        }

        const user = JSON.parse(userJSON.toString());
        if(user.Password !== password){
            throw new Error(`Email and Pass doesnt match any user in database`);
        }
        return userJSON.toString();
    }

    //Create files
    async CreateFile(ctx, key, name, downloadLink, fileHash, uploaderEmail) {


        const file = {
            Key: key,
            Name: name,
            DownloadLink: downloadLink,
            FileHash: fileHash,
            UploaderEmail: uploaderEmail,
            DocType: 'file',
            Deleted: false
        };
        //we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(file)));
        return JSON.stringify(file);
    }

    //Find File
    async FindFile(ctx, key) {
        const fileJSON = await ctx.stub.getState(key); 
        if (!fileJSON || fileJSON.length === 0) {
            throw new Error(`The file does not exist`);
        }
        return fileJSON.toString();
    }

    //Change the name of the file
    async ChangeFileName(ctx, key, newName) {
        const fileJSON = await ctx.stub.getState(key); 
        if (!fileJSON || fileJSON.length === 0) {
            throw new Error(`The file does not exist`);
        }
        let file = JSON.parse(fileJSON.toString());
        file.Name= newName;
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(file)));
        return JSON.stringify(file);
    }

    //Delete Files
    async DeleteFile(ctx, key) {
        const fileJSON = await ctx.stub.getState(key);
        if (!fileJSON || fileJSON.length === 0) {
            throw new Error(`The file does not exist`);
        }
        await ctx.stub.deleteState(key);
        const stat = {stat: 'Deleted'};
        return JSON.stringify(stat.stat);
    }
    //Find file by user email
    async FindFileByUser(ctx, email) {
      let queryString ={};
      queryString.selector={};
      queryString.selector.DocType='file';
      queryString.selector.UploaderEmail=email;

      return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString));
    
    }
    async ShareFile(ctx, key, fileKey,sharedWithEmail) {


        const fileShare = {
            Key: key,
            FileKey:fileKey,
            SharedWithEmail:sharedWithEmail,
            DocType: 'fileShare',
            
        };
        //we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(fileShare)));
        return JSON.stringify(fileShare);
    }

    async FindFileShareByFile(ctx, fileKey) {
        let queryString ={};
        queryString.selector={};
        queryString.selector.DocType='fileShare';
        queryString.selector.FileKey=fileKey;
  
        return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString));
      
      }

      async DeleteFileShare(ctx, key) {
        const fileShareJSON = await ctx.stub.getState(key);
        if (!fileShareJSON || fileShareJSON.length === 0) {
            throw new Error(`The file does not exist`);
        }
        await ctx.stub.deleteState(key);
        const stat = {stat: 'File Share Deleted'};
        return JSON.stringify(stat.stat);
    }

    async GetQueryResultForQueryString(ctx, queryString) {

		let resultsIterator = await ctx.stub.getQueryResult(queryString);
		let results = await this._GetAllResults(resultsIterator, false);

		return JSON.stringify(results);
	}

async FindFileShareByUser(ctx, userEmail) {
        let queryString ={};
        queryString.selector={};
        queryString.selector.DocType='fileShare';
        queryString.selector.SharedWithEmail=userEmail;
  
        return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString));
      
      }


    async _GetAllResults(iterator, isHistory) {
		let allResults = [];
		let res = await iterator.next();
		while (!res.done) {
			if (res.value && res.value.value.toString()) {
				let jsonRes = {};
				console.log(res.value.value.toString('utf8'));
				if (isHistory && isHistory === true) {
					jsonRes.TxId = res.value.txId;
					jsonRes.Timestamp = res.value.timestamp;
					try {
						jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
					} catch (err) {
						console.log(err);
						jsonRes.Value = res.value.value.toString('utf8');
					}
				} else {
					jsonRes.Key = res.value.key;
					try {
						jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
					} catch (err) {
						console.log(err);
						jsonRes.Record = res.value.value.toString('utf8');
					}
				}
				allResults.push(jsonRes);
			}
			res = await iterator.next();
		}
		iterator.close();
		return allResults;
	}


    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async UpdateAsset(ctx, id, color, size, owner, appraisedValue) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            ID: id,
            Color: color,
            Size: size,
            Owner: owner,
            AppraisedValue: appraisedValue,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
    }

    // DeleteAsset deletes an given asset from the world state.
    async DeleteAsset(ctx, id) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in the world state.
    async TransferAsset(ctx, id, newOwner) {
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        asset.Owner = newOwner;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
    }

    // GetAllAssets returns all assets found in the world state.
    async GetAllAssets(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = TDrive;
