/*
Route : PATCH /note
*/

const AWS = require('aws-sdk');
AWS.config.update({region : 'us-east-1'});

const documentClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.NOTES_TABLE; // Defined in Serverless.yaml

const util = require('./utils.js');

const moment = require('moment');


exports.handler = async (event) => {

    try{

        let item = JSON.parse(event.body).Item;
        item.user_id = util.getUserId(event.headers);
        item.user_name = util.getUserName(event.headers);

        /*
        Item Structure : While updating we need to pass all the values , otherwise it will be stored as empty
        {
	    "Item":{
		    "title": "My Updated First Note",
		    "timestamp":1588589725,
		    "note_id":"ec96b849-9f74-482f-9955-513af94813a9",
		    "cat":"General"
	        }
        }
        Also we need to pass primary key (user_id) along with user_name in Request Header.
        */
        
        let data = await documentClient.put({
            TableName: TABLE_NAME,
            Item: item,            
            ConditionExpression: '#nId = :nId',
            ExpressionAttributeNames:{
                '#nId': 'note_id'
            },
            ExpressionAttributeValues:{
                ':nId' : item.note_id
            }            

        }).promise();

        return {
            headers: util.getResponseHeaders(),
            statusCode: 200,
            body: JSON.stringify(item)
        }

    }
    catch(err)
    {
        return {
            statusCode : err.statusCode ? err.statusCode : 500,
            headers: util.getResponseHeaders(),
            body: JSON.stringify({
                message : err.message ? err.message : "Unknown Error",
                error: err.name ? err.name : "Exception"
            })
        }
    }

}