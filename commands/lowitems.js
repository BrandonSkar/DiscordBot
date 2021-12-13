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
    name: 'lowitems',
    description: "Displays the critically low items in the guild bank",
    async execute(message, args, Discord) {

        const params = {
            TableName: tableName,
            ScanIndexForward: false
        }

        const result = await docClient.scan(params).promise();

        var itemString = '';
        var criticallyLow = false;

        for(var i = result.Items.length - 1; i >- 0; i--)
        {
            if(result.Items[i].critical)
            {
                criticallyLow = true;
                break;
            }
        }

        if(result.Count > 0 && criticallyLow)
        {
            for(var i = result.Items.length - 1; i >= 0; i--)
            {
                if(result.Items[i].critical && result.Items[i].amount < result.Items[i].lowAmount)
                    itemString += result.Items[i].item + ' x' + result.Items[i].amount + '  -  Needed: ' + result.Items[i].lowAmount + '\n';
            }
    
            const newEmbed = new Discord.MessageEmbed()
            .setColor('#26ff00')
            .setTitle('Guild Bank')
            .setDescription('These are the critically low items in the guild bank')
            .addField('CRITICALLY LOW ITEMS', itemString, true)
    
            message.channel.send({ embeds: [newEmbed] });
        }
        else if(result.Count > 0)
        {
            message.channel.send('There are no critically low items');
        }
        else
        {
            message.channel.send('Guild Bank Empty');
        }
    }
}