/*
Route : POST /note
*/

const AWS = require('aws-sdk');
AWS.config.update({region : 'us-east-1'});

const momnent = require('moment');
const {v4:uuidv4} = require('uuid');

const documentClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.NOTES_TABLE; // Defined in Serverless.yaml

const util = require('./utils.js');

exports.handler = async (event) => {

    try{

        let item = JSON.parse(event.body).Item;
        item.user_id = util.getUserId(event.headers);
        item.user_name = util.getUserName(event.headers);
        item.note_id = uuidv4();
        item.timestamp = momnent().unix();

        let data = await documentClient.put({
            TableName: TABLE_NAME,
            Item: item
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