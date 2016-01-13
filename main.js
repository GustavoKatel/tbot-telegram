// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
var Chance = require('chance');

var config = require('./config');

var Bot = require('./bot');

var bot = new Bot(config);

var MINHAS_IDENTIDADE = "Twitter: http://twitter.com/botanado \
THE END \
eh das ideia de http://twitter.com/GustavoKatel";

var OS_COMANDO = "/info - amostra as identidade";

bot.onCorpusProgress(function(i, total) {
  console.log(i + '/' + total);
});

bot.on('message', function(msg) {

  // console.log(msg);
  console.log('Received ['+msg.from.first_name+' '+msg.from.last_name+']: ' +
              ' [text]: ' + ( msg.text || 'false' ) +
              ' [audio]: ' + (msg.audio ? 'true' : 'false') +
              ' [voice]: ' + (msg.voice ? 'true' : 'false') +
              ' [photo]: ' + (msg.photo ? 'true' : 'false') +
              ' [document]: ' + (msg.document ? 'true' : 'false') +
              ' [video]: ' + (msg.video ? 'true' : 'false'));

  if(msg.text) {

    if(msg.text == '/info') {

      bot.sendMessage(msg.chat.id, MINHAS_IDENTIDADE);

    } else if(msg.text == '/help') {

      bot.sendMessage(msg.chat.id, OS_COMANDO);

    } else {

      bot.respond(msg.text).then(function(res) {
        bot.sendMessage(msg.chat.id, msg.message_id, res).then(function(data) {
          console.log('Replied to '+msg.from.first_name+' '+msg.from.last_name+': '+res);
        });
      });

    }

  } else if(msg.voice) {

    bot.sendAudio(msg.chat.id, msg.message_id, 'data/nao_entendo_ainda.ogg').then(function(data) {
      console.log('Replied to '+msg.from.first_name+' '+msg.from.last_name+': Audio \'Não entendo ainda\'');
    });

  } else if(msg.left_chat_participant) {

    bot.sendMessage(msg.chat.id, 'Ja foi tarde').then(function(data) {
      console.log('Sent to '+msg.chat.title+': Já foi tarde');
    });

  } else if(msg.new_chat_participant) {

    var username = msg.new_chat_participant.username;
    var res = 'Fala, ' + ( username ? '@'+username : msg.new_chat_participant.first_name );

    bot.sendMessage(msg.chat.id, res).then(function(data) {
      console.log('Sent to '+msg.chat.title+': Greetings: '+res);
    });

  } else if(msg.new_chat_title) {

    bot.respond(msg.new_chat_title).then(function(res) {
      bot.sendMessage(msg.chat.id, res).then(function(data) {
        console.log('Commenting new chat title: '+msg.new_chat_title+' -> '+res);
      });
    });

  }
  // else {
  //
  //   bot.sendMessage(msg.chat.id, msg.message_id, 'Entendo esses paranauê ainda não').then(function(data) {
  //     console.log('Replied to '+msg.from.first_name+' '+msg.from.last_name+': Not implemented');
  //   });
  //
  // }

});
