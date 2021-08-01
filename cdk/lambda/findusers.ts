import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const documentClient = new DynamoDB.DocumentClient();
exports.handler = async function (event: APIGatewayProxyEvent, context: Context): Promise<any> {
    console.log("FindUse Request: ", event);
    
    /*
    // this is if we want to keep id as separate but it will cost in searching
    const params = {
        TableName: process.env.TABLE_NAME || "",
        FilterExpression: "#pa = :pavalue",
        ExpressionAttributeNames:{
            "#pa": "publicAddress"
        },
        ExpressionAttributeValues: {
            ":pavalue": event.queryStringParameters?.publicAddress
        }
    }
    const data = await documentClient.scan(params).promise();
    */
    const params = {
        TableName: process.env.TABLE_NAME || "",
        Key: {
            publicAddress:event.queryStringParameters?.publicAddress
        }
    }
    console.log("params = ",params);
    const data = await documentClient.get(params).promise();
    console.log("data after get = ",data);
    return {
        statusCode:200,
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*"
        },
        body: JSON.stringify(data)
    }
}