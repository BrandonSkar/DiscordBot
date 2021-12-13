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
    name: 'deleteitems',
    description: "Delete items from the guild bank",
    async execute(message, args) {

        var itemName = '';
        args.forEach(element => {
            itemName += element;
        });

        if(!itemName) return message.channel.send('Enter An Item Name');

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
            docClient.delete(params, (error) => {
                if(!error) {
                    return message.channel.send('Deleted ' + itemInfo.name + ' from guild bank.');
                } else {
                    throw "Invalid " + error;
                }
            });
        } else {
            return message.channel.send(itemInfo.name + ' not found in bank');
        }
    }
}