/*
Route : GET /note/n/{note_id}
*/

const AWS = require('aws-sdk');
AWS.config.update({region : 'us-east-1'});

const documentClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.NOTES_TABLE; // Defined in Serverless.yaml
const util = require('./utils.js');
const _ = require('underscore');

exports.handler = async (event) => {

    try{

        let note_id = decodeURIComponent(event.pathParameters.note_id);

        let params = {
            TableName: TABLE_NAME,
            IndexName: "note_id-index",
            KeyConditionExpression : "note_id = :note_id",
            ExpressionAttributeValues:{
                ":note_id" : note_id
            }
        };

        let data = await documentClient.query(params).promise();
        if(!_.isEmpty(data.Items))
        {
            return {
                headers: util.getResponseHeaders(),
                statusCode: 200,
                body: JSON.stringify(data.Items[0])
            };
        }
        else
        {
            return {
                statusCode:404,
                headers: util.getResponseHeaders()
            }

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