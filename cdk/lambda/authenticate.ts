import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { recoverPersonalSignature } from 'eth-sig-util';
// In tsconfig.json set esModuleInterop to true for ethereumjs-util to work in import style
import {bufferToHex} from 'ethereumjs-util';
import { sign as jwtSign } from 'jsonwebtoken'

const documentClient = new DynamoDB.DocumentClient();
exports.handler = async function (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    console.log("Authenticate Request: ", event);
    console.log("parameter1 = ", event.body)
    const body = JSON.parse(event.body || "");
    
    const params = {
        TableName: process.env.TABLE_NAME || "",
        Key: {
            publicAddress:body.publicAddress 
        }
    }
    console.log("params = ",params);
    const data = await documentClient.get(params).promise();
    console.log("data after get = ",data);
    if(!data.Item) {
        return response({isError: true, error: `User with publicAddress ${body.publicAddress} is not found in database`})
    }
    const message = `My App Auth Service Signing nonce: ${data.Item.nonce}`
    const msgBufferHex = bufferToHex(Buffer.from(message, 'utf8'));
    const address = recoverPersonalSignature({
        data: msgBufferHex,
        sig: body.signature,
    });
    if(address.toLowerCase() !== body.publicAddress.toLowerCase()){
        return response({isError: true, error: `Signature verification failed`})
    }
    
    const userUpdateParams = {
        TableName: process.env.TABLE_NAME || "",
        Key: {
            publicAddress:body.publicAddress 
        },
        UpdateExpression: "set nonce = :n",
        ExpressionAttributeValues: {
            ":n":Math.floor(Math.random() * 10000)
        },
        ReturnValues:"UPDATED_NEW"
    }
    const updateUserResponse = await documentClient.update(userUpdateParams).promise();
    console.log(" updated data after ",updateUserResponse);
    const secret = "shhhh";
    const accessToken = jwtSign({
        payload: {
            publicAddress: data.Item.publicAddress
        }
    },
    secret);
    return response({accessToken});
}

function response (data:any){
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