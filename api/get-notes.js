/*
Route : GET /notes
*/

const AWS = require('aws-sdk');
AWS.config.update({region : 'us-east-1'});

const documentClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.NOTES_TABLE; // Defined in Serverless.yaml

const util = require('./utils.js');

exports.handler = async (event) => {

    try{

        let user_id = util.getUserId(event.headers);

        //Needed for Pagination
        let query = event.queryStringParameters; 
        let limit = query && query.limit ? parseInt(query.limit) : 5; // Init value of limit = 5 if no limit has been mentioned explicitly
        
        let params = {
            TableName: TABLE_NAME,
            KeyConditionExpression: "user_id = :uid",
            ExpressionAttributeValues:{
                ":uid": user_id
            },
            Limit:limit,
            ScanIndexForward: false
        };

        //Starting indicator of the next page records.
        let startTimeStamp = query && query.start ? parseInt(query.start): 0;
        //Subsequent get request : http://localhost:3000/prod/notes/?limit=5&start=<<timestamp value of lastEvaluatedKey>>
        /*
            "Count": 5,
            "ScannedCount": 5,
            "LastEvaluatedKey": {
            "user_id": "test_user",
            "timestamp": 1588589823 
            }

            //LastEvaluatedKey values returned by DyanamoDB(Primary Key + Sort Key)
        */
        //http://localhost:3000/prod/notes/?limit=5&start=1588589823
        if(startTimeStamp > 0) {
            params.ExclusiveStartKey = {
                user_id: user_id,//ExclusiveStartKey expects primary key
                timestamp: startTimeStamp // If there is a sort key with partition key, "ExclusiveStartKey" Options must indicate both partition key and sort key.
            }
        }

        let data = await documentClient.query(params).promise();

        return {
            headers: util.getResponseHeaders(),
            statusCode: 200,
            body: JSON.stringify(data)
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