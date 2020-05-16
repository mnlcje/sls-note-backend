/*
Route : DELETE /note/t/{timestamp}
*/

const AWS = require('aws-sdk');
AWS.config.update({region : 'us-east-1'});

const documentClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.NOTES_TABLE; // Defined in Serverless.yaml

const util = require('./utils.js');

exports.handler = async (event) => {

    try{
        let timestamp = parseInt(event.pathParameters.timestamp);
        let params = {
            TableName : TABLE_NAME,
            Key:{
                user_id: util.getUserId(event.headers),
                timestamp: timestamp
            } 
        }

       await documentClient.delete(params).promise();

        return {
            headers: util.getResponseHeaders(),
            statusCode: 200,
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