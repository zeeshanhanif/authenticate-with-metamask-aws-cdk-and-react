import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';
import * as dynamo from '@aws-cdk/aws-dynamodb';
import * as iam from '@aws-cdk/aws-iam'

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const userTable = new dynamo.Table(this, "userTable",{
      tableName: "Users",
      partitionKey: {
        name: 'publicAddress',
        type: dynamo.AttributeType.STRING
      }
    })

    const dependenciesLayer = new lambda.LayerVersion(this, "dependencies", {
      layerVersionName: "Dependencies",
      code: lambda.Code.fromAsset("lambda-layer"),
    });

    const authenticate = new lambda.Function(this,"AuthenticateHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "authenticate.handler",
      environment: {
        TABLE_NAME: userTable.tableName
      },
      layers: [dependenciesLayer]
    })

    const signup = new lambda.Function(this,"SignupHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "signup.handler",
      environment: {
        TABLE_NAME: userTable.tableName
      },
      layers: [dependenciesLayer]
    })

    const findUsers = new lambda.Function(this,"FindUsersHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "findusers.handler",
      environment: {
        TABLE_NAME: userTable.tableName
      },
      layers: [dependenciesLayer]
    })

    const getAuthUser = new lambda.Function(this,"GetAuthUserHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "getAuthUser.handler",
      environment: {
        TABLE_NAME: userTable.tableName
      },
      layers: [dependenciesLayer]
    })
/*
    const policy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["lambda:*"],
      resources: ['*']
    });
*/
    /*
    authenticate.addToRolePolicy(policy);
    signup.addToRolePolicy(policy);
    findUsers.addToRolePolicy(policy);
    */

    userTable.grantFullAccess(authenticate);
    userTable.grantFullAccess(signup);
    userTable.grantFullAccess(findUsers);
    userTable.grantFullAccess(getAuthUser);

    const api = new apigw.RestApi(this,"auth-apis",{
      restApiName: 'authApi',
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS, // this is also the default
      }
    });

    const findUserResource = api.root.addResource('finduser');
    const findUserIntegration = new apigw.LambdaIntegration(findUsers);
    findUserResource.addMethod("GET", findUserIntegration);

    const signupResource = api.root.addResource('signup');
    const signupIntegration = new apigw.LambdaIntegration(signup);
    signupResource.addMethod("POST", signupIntegration);

    const authenticateResource = api.root.addResource('authenticate');
    const authenticateIntegration = new apigw.LambdaIntegration(authenticate);
    authenticateResource.addMethod("POST", authenticateIntegration);

    const getAuthUserResource = api.root.addResource('authuser');
    const getAuthUserIntegration = new apigw.LambdaIntegration(getAuthUser);
    getAuthUserResource.addMethod("GET", getAuthUserIntegration);

  }
}
