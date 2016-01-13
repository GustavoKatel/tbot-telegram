// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
'use strict';

var telegram = require('telegram-bot-api');
var markov = require('markov');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var schedule = require('node-schedule');
var Chance = require('chance');

/**
* Events:
* - corpusReady
* - corpusProgress (index, total)
* - onText (msg, match) - emited when there's a new message that matches the msg
* - on (msg) - emitted when there's a new direct message
*/

class Bot {
  constructor(config /*optional*/) {
    this.config = config || {};

    this.telegram = new telegram({
      token: config.token,
      updates: {
          enabled: true
      }
    });

    this.generator = markov(this.config.MARKOV_ORDER);

    this.emitter = new EventEmitter();

    this.chance = new Chance();

    this.corpusReady = false;
    var $this = this;
    this.emitter.once('corpusReady', function() {
      $this.corpusReady = true;
    });
    this._loadCorpus();

  }

  _loadCorpus() {
    var $this = this;

    if (fs.existsSync(this.config.CORPUS_DIGEST)) {

      this.generator.load(this.config.CORPUS_DIGEST, function() {
        $this.emitter.emit('corpusReady');
      });

    } else {

      fs.readFile(this.config.CORPUS, 'utf-8', function(err, data) {
        if (err) {
          console.log(err);
          return;
        }

        var obj = JSON.parse(data);
        var total = obj.length;

        // TODO: TEMP
        // obj = obj.splice(0, 1000);

        var promises = obj.map(function(tweet, index) {

          return new Promise(function(resolve, reject) {

            var text = $this.clean(tweet);
            $this.generator.seed(text, function() {
              $this.emitter.emit('corpusProgress', index, total);
              resolve();
            });

          });

        });

        Promise.all(promises).then(function() {
          $this.generator.save($this.config.CORPUS_DIGEST, function() {
            $this.emitter.emit('corpusReady');
          });
        });

      });

    }

  }

  clean(text_) {
    if (!text_) {
      return '';
    }

    var regexList = [
      /([a-z0-9\-\_\.\+]+@)?(https?:\/\/)?([a-z0-9\-\_\/]+)(\.([a-z0-9\-\_\/]+))+([\?\&a-z0-9\=])*/ig, // emails, urls
      /(@\w+)/ig, // usernames,
      /RT(\s:)?/ig, // rt sentence
    ];

    var text = text_;

    regexList.forEach(function(regex) {
      text = text.replace(regex, '');
    });

    return text;
  }

  _makeText(input) {
    var max = 140; // characters

    var words = [];

    if (!input) {
      var key = this.generator.pick();
      words = this.generator.fill(key, this.config.MAX_WORDS);
    } else {
      words = this.generator.respond(input, this.config.MAX_WORDS);
    }

    while (words.join(' ').length > max) {
      words.splice(words.length - 1, 1);
    }

    return words.join(' ');
  }

  respond(input_) {
    var $this = this;

    var input = this.clean(input_);

    return new Promise(function(resolve, reject) {

      if (!$this.corpusReady) {

        $this.emitter.once('corpusReady', function() {
          var res = $this._makeText(input);
          resolve(res);
        });

      } else {

        var res = $this._makeText(input);
        resolve(res);

      }

    });
  }

  onCorpusProgress(cb) {
    this.emitter.on('corpusProgress', cb);
  }

  on(ev, fn) {
    this.telegram.on(ev, fn);
  }

  sendMessage(toId, replyToMsgId, msg) {
    var _msg = msg;
    var _rmid = replyToMsgId;
    if(!_msg) {
      _msg = replyToMsgId;
      _rmid = '';
    }

    var options = {
      chat_id: toId,
      text: _msg,
      reply_to_message_id: _rmid
    }

    // console.log(options);
    return this.telegram.sendMessage(options);
  }

  sendAudio(toId, replyToMsgId, filePath) {
    var _filePath = filePath;
    var _rmid = replyToMsgId;
    if(!_filePath) {
      _filePath = replyToMsgId;
      _rmid = '';
    }

    var options = {
      chat_id: toId,
      audio: _filePath,
      reply_to_message_id: _rmid
    }

    // console.log(options);
    return this.telegram.sendAudio(options);
  }

  schedule(cron, fun) {
    schedule.scheduleJob(cron, fun);
  }

  humanDelay(fun) {
    var t = this.chance.integer({min: 1, max: 5});
    setTimeout(fun, t * 2000);
  }

};

module.exports = Bot;
