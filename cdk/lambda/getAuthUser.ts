import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { JwtPayload, verify as jwtVerify } from 'jsonwebtoken'

const documentClient = new DynamoDB.DocumentClient();

interface JwtDecoded {
	payload: {
		publicAddress: string;
	};
}
exports.handler = async function (event: APIGatewayProxyEvent, context: Context): Promise<any> {
    console.log("getAuthUser Request: ", event);
    console.log("getAuthUser auth header : ", event.headers.Authorization);
    const accessToken = event.headers["Authorization"]?.split(" ")[1] || "";
    console.log("getAuthUser auth header : ", accessToken);
    console.log("need to check header and verify access token");
    const publicAddress = event.queryStringParameters?.publicAddress;
    try {
        const secret = "shhhh";
        var decoded:any = jwtVerify(accessToken, secret);
        console.log("decoded = ",decoded);
        if(decoded.payload.publicAddress.toLowerCase() !== publicAddress?.toLowerCase()) {
            return response({isError: true, error: `AccessToken verification failed`})
        }
    }
    catch(error){
        return response({isError: true, error: `AccessToken verification failed`})
    }
    
    const params = {
        TableName: process.env.TABLE_NAME || "",
        Key: {
            publicAddress:event.queryStringParameters?.publicAddress
        }
    }
    console.log("params = ",params);
    const data = await documentClient.get(params).promise();
    console.log("data after get = ",data);
    return response(data);
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