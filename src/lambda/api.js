const db = require("../utils/db");
const {
    GetItemCommand,
    PutItemCommand,
    DeleteItemCommand,
    ScanCommand,
    UpdateItemCommand,
    QueryCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");


// create welcome route and return a welcome message
const welcome = async () => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Welcome to the serverless users API!",
        }),
    };
};

//get all users
const getAllUsers = async () => {
    const response = { statusCode: 200 };

     try {
        const { Items } = await db.send(new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME }));

        response.body = JSON.stringify({
            message: "Successfully retrieved all users.",
            data: Items.map((item) => unmarshall(item)),
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to retrieve posts.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;

}

// register a user
const register = async (event) => {
    const response = { statusCode: 200 };

    try {
        const body = JSON.parse(event.body);
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: marshall(body || {}),
        };
        const createResult = await db.send(new PutItemCommand(params));

        response.body = JSON.stringify({
            message: "Successfully created user.",
            createResult,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to create user.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
}


// get only users who are renters
const getRenters = async () => {
    const response = { statusCode: 200 };

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            IndexName: "role-index",
            KeyConditionExpression: "#role = :role",
            ExpressionAttributeNames: {
                '#role': 'role'
            },
            ExpressionAttributeValues: marshall({
                ":role":  "renter",
            }),
        };
        const command = new QueryCommand(params);

        const { Items }  = await db.send(command);

        response.body = JSON.stringify({
            message: "Successfully retrieved all renters.",
            data: Items.map((item) => unmarshall(item)),
            Items
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to retrieve renters.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;

}


// get only users who are buyers
const getBuyers = async () => {
    const response = { statusCode: 200 };

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            IndexName: "role-index",
            KeyConditionExpression: "#role = :role",
            ExpressionAttributeNames: {
                '#role': 'role'
            },
            ExpressionAttributeValues: marshall({
                ":role": "buyer",
            }),
        };
        const command = new QueryCommand(params);

        const { Items } = await db.send(command);
        
        response.body = JSON.stringify({
            message: "Successfully retrieved all buyers.",
            data: Items.map((item) => unmarshall(item)),
            Items,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to retrieve buyers.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;

}


// match only users with the same property id
const matchUsers = async (event) => {
    const response = { statusCode: 200 };

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            IndexName: "propertyId-index",
            KeyConditionExpression: "#propertyId = :propertyId",
            ExpressionAttributeNames: {
                "#propertyId": "propertyId"
            },
            ExpressionAttributeValues: marshall({
                ":propertyId": event.pathParameters.propertyId,
            }),
        };
        const command = new QueryCommand(params);

        const { Items } = await db.send(command);

        response.body = JSON.stringify({
            message: "Successfully matched a buyer and renter interested in the same property.",
            data: Items.map((item) => unmarshall(item)),
            Items,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to retrieve users.",
            errorMsg: e.message,
            errorStack: e.stack,
        });

    }

    return response;

}


//delete a user
const deleteUser = async (event) => {
    const response = { statusCode: 200 };

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({
                id: event.pathParameters.id,
            }),
        };
        const deleteResult = await db.send(new DeleteItemCommand(params));
        
        response.body = JSON.stringify({
            message: "Successfully deleted user.",
            deleteResult,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to delete user.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;

}

//update a user
const updateUser = async (event) => {
    const response = { statusCode: 200 };
    
    try {
        const body = JSON.parse(event.body);
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({
                id: event.pathParameters.id,
            }),
            UpdateExpression: "set #userId = :userId, #name = :name, #DOB = :DOB, #role = :role, #location = :location, #propertyId = :propertyId",
            ExpressionAttributeNames: {
                "#userId": "userId",
                "#name": "name",
                "#DOB": "DOB",
                "#role": "role",
                "#location": "location",
                "#propertyId": "propertyId",
                
            },
            ExpressionAttributeValues: marshall({
                ":name": body.name,
                ":DOB": body.DOB,
                ":role": body.role,
                ":location": body.location,
                ":propertyId": body.propertyId,
            }),
        };
        const updateResult = await db.send(new UpdateItemCommand(params));

        response.body = JSON.stringify({
            message: "Successfully updated user.",
            updateResult,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to update user.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
}







//export all functions
module.exports = {
    welcome,
    getAllUsers,
    register,
    getRenters,
    getBuyers,
    matchUsers,
    deleteUser,
    updateUser,
}