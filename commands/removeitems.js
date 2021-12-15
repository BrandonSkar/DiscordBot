require('dotenv').config();
const Database = require('wow-classic-items');
const AWS = require('aws-sdk');
AWS.config.update({
    region: process.env.aws_default_region,
    accessKeyId: process.env.dynamodb_id,
    secretAccessKey: process.env.dynamodb_secret
})

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'Guild_Bank';

module.exports = {
    name: 'removeitems',
    description: "Remove items from the guild bank",
    async execute(message, args) {
        var numTaking = Number(args.pop());

        var itemName = '';
        args.forEach(element => {
            itemName += element;
        });

        if(!itemName) return message.channel.send('Enter An Item Name');
        if(!numTaking) return message.channel.send('Enter Amount To Add To Bank');
        if(numTaking <= 0 || !Number.isInteger(numTaking)) return message.channel.send('Only positive integers');

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

        //if null add new item to database
        if(result.Item != null)
        {
            var totalAmount = result.Item.amount - numTaking;
            if(totalAmount <= 0) totalAmount = 0;
            

            if(totalAmount === 0 && !result.Item.critical)
            {
                docClient.delete(params, (error) => {
                    if(!error) {
                        return message.channel.send('Removed ' + itemInfo.name + ' x' + numTaking + ' from guild bank. (total: ' + totalAmount + ')');
                    } else {
                        throw "Invalid " + error;
                    }
                });
            } else {
                var isLow = false;

                //check if the item is critically low after taking the amount
                if(result.Item.critical && totalAmount < result.Item.lowAmount)
                {
                    isLow = true;
                }

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
                    if(!error && isLow)
                    {
                        return message.channel.send('Removed ' + itemInfo.name + ' x' + numTaking + ' from guild bank. (total: ' + totalAmount + ')\n' + itemInfo.name + ' is critcally low. (On hand: ' + totalAmount + ' - needed: ' + result.Item.lowAmount + ')');
                    }
                    else if(!error) {
                        return message.channel.send('Removed ' + itemInfo.name + ' x' + numTaking + ' from guild bank. (total: ' + totalAmount + ' )');
                    } else {
                        throw "Invalid " + error;
                    }
                });
            }

        } else {
            return message.channel.send(itemInfo.name + ' not found in bank');
        }
    }
}