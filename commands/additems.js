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
    name: 'additems',
    description: "Add items to the guild bank",
    async execute(message, args) {
        var numDepositing = Number(args.pop());

        var itemName = '';
        args.forEach(element => {
            itemName += element;
        });

        if(!itemName) return message.channel.send('Enter An Item Name');
        if(!numDepositing) return message.channel.send('Enter Amount To Add To Bank');

        if(numDepositing <= 0 || !Number.isInteger(numDepositing)) return message.channel.send('Only positive integers');

        //Get item info from wow-classic-items
        var itemInfo = null;
        const items = new Database.Items();
        items.forEach(element => {
            if(element.name.toString().toLowerCase().replace(/\s/g, '') === itemName)
            {
                itemInfo = element;
            }
        });
        if(itemInfo === null) return message.channel.send('Invalid Item');

        var params = {
            TableName: tableName,
            Key: {
                itemId: itemInfo.itemId,
                item: itemInfo.name
            }
        }
    
        var result = await docClient.get(params).promise();
        
        if(result.Item != null)
        {
            var totalAmount = result.Item.amount + numDepositing;
            
            var params = {
                TableName: tableName,
                Item: {
                    itemId: itemInfo.itemId,
                    item: itemInfo.name,
                    amount: totalAmount,
                    critical: result.Item.critical,
                    lowAmount: result.Item.lowAmount
                }
            }

            docClient.put(params, (error) => {
                if(!error) {
                    return message.channel.send('Added ' + itemInfo.name + ' x' + numDepositing + ' to guild bank. (total: ' + totalAmount + ')');
                } else {
                    throw "Invalid " + error;
                }
            });
        } else {
            
            var params = {
                TableName: tableName,
                Item: {
                    itemId: itemInfo.itemId,
                    item: itemInfo.name,
                    amount: numDepositing,
                    critical: false,
                    lowAmount: 0
                }
            }
    
            docClient.put(params, (error) => {
                if(!error) {
                    return message.channel.send('Added ' + itemInfo.name + ' x' + numDepositing + ' to guild bank. (total: ' + numDepositing + ')');
                } else {
                    throw "Invalid " + error;
                }
            });
        }
    }
}