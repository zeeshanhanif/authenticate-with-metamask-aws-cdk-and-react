import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const documentClient = new DynamoDB.DocumentClient();

exports.handler = async function (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    console.log("Signup Request: ", event);
    console.log("parameter = ", event.body)
    console.log("parameter = ", JSON.parse(event.body||""));
    const body = JSON.parse(event.body || "");
    const newUser = {
        //id: uuidv4(),
        nonce: Math.floor(Math.random() * 10000),
        publicAddress: body.publicAddress,
        isNewUser: true,
        username: ""
    }
    const params = {
        TableName: process.env.TABLE_NAME || "",
        Item: newUser        
    }
    const data = await documentClient.put(params).promise();
    console.log("data after put = ",data);
    console.log("newuser after put params = ",newUser);
    return {
        statusCode:200,
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*"
        },
        body: JSON.stringify(newUser)
    }
}