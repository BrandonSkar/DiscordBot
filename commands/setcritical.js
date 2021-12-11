require('dotenv').config();
const Database = require('wow-classic-items');
const AWS = require('aws-sdk');

AWS.config.update({
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.DYNAMODB_ID,
    secretAccessKey: process.env.DYNAMODB_SECRET
})

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'Guild_Bank';

module.exports = {
    name: 'setcritical',
    description: "Set an item as critical",
    async execute(message, args) {
        var lastElement = args.pop();
        var lowAmount = Number(lastElement);
        
        //perform action for setting isCritical to false
        if(lastElement === 'f' || lastElement === 'false')
        {
            SetItemCriticalToFalse(message, args);
            return;
        }
        else if(lowAmount != NaN)
        {
            SetItemCriticalToTrue(message, args, lowAmount);
        }
    }
}

async function SetItemCriticalToFalse(message, args)
{
    var itemName = '';
    args.forEach(element => {
        itemName += element;
    });

    var itemInfo = GetItemInfo(message, itemName);
    var result = await GetItemFromDatabase(itemInfo);

    if(result.Item != null)
    {
        var params = {
            TableName: tableName,
            Item: {
                itemId: itemInfo.itemId,
                item: itemInfo.name,
                amount: result.Item.amount,
                critical: false,
                lowAmount: 0
            }
        }

        docClient.put(params, (error) => {
            if(!error) {
                return message.channel.send(itemInfo.name + ' - Critcal: False');
            } else {
                throw "Invalid " + error;
            }
        });
    }
    else
    {
        return message.channel.send(itemInfo.name + " is not in the bank");
    }
}

async function SetItemCriticalToTrue(message, args, lowAmount)
{
    var itemName = '';
    args.forEach(element => {
        itemName += element;
    });

    var itemInfo = GetItemInfo(message, itemName);
    var result = await GetItemFromDatabase(itemInfo);

    if(result.Item != null)
    {
        var params = {
            TableName: tableName,
            Item: {
                itemId: itemInfo.itemId,
                item: itemInfo.name,
                amount: result.Item.amount,
                critical: true,
                lowAmount: lowAmount
            }
        }

        docClient.put(params, (error) => {
            if(!error) {
                return message.channel.send(itemInfo.name + ' - Critcal: True' + ' - Critical Amount: ' + lowAmount);
            } else {
                throw "Invalid " + error;
            }
        });
    }
    else
    {
        var params = {
            TableName: tableName,
            Item: {
                itemId: itemInfo.itemId,
                item: itemInfo.name,
                amount: 0,
                critical: true,
                lowAmount: lowAmount
            }
        }

        docClient.put(params, (error) => {
            if(!error) {
                return message.channel.send(itemInfo.name + ' --- Critcal: True' + ' - Critical Amount: ' + lowAmount);
            } else {
                throw "Invalid " + error;
            }
        });
    }
}

function GetItemInfo(message, itemName)
{
    if(itemName === undefined) return message.channel.send('To set item as critical: !crit (item name) (true/false) (minimum number)\nex: !crit flask of blinding light true 10');
    var itemInfo = null;
    const items = new Database.Items();
    items.forEach(element => {
        if(element.name.toString().toLowerCase().replace(/\s/g, '') === itemName)
        {
            itemInfo = element;
        }
    });
    if(itemInfo === null) return message.channel.send('Invalid Item');

    return itemInfo;
}

async function GetItemFromDatabase(itemInfo)
{
    var params = {
        TableName: tableName,
        Key: {
            itemId: itemInfo.itemId,
            item: itemInfo.name
        }
    }

    var result = await docClient.get(params).promise();
    return result;
}