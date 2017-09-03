const Discord = require('discord.js');
const client = new Discord.Client();

var fs = require('fs');

const token = 'MzM4MDQzMTk5NDA4OTYzNTg0.DFTdvQ.p0VUfjqsU1CR8OfWCZ-yswjZwfU';

const prefix = '&';

// check if ready
client.on('ready', () => {
	console.log('I am ready!');
	client.user.setGame('&help for commands');
});

// check for commands and respond
client.on('message', message => {
	if(message.content.substring(0, 1) == prefix) {
		if(message.content == prefix + 'help') {
			var response = 'Use another bot, I\'m useless at the moment.';
			message.reply(response);
		}

		else {
			var response = 'Command not recognised.';
			message.channel.send(response);
		}
	}
});


// Log our bot in
client.login(token);
