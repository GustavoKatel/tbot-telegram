# tbot
Just another twitter bot (using markov chain)

## Configuration

    config = {
      token: 'TELEGRAM_BOT_TOKEN',

      MARKOV_ORDER: 3,

      CORPUS: 'corpus/all.json',
      CORPUS_DIGEST: 'corpus/all.model',

      BOT_NAME: 'botanado',

      MAX_WORDS: 5
    };

    var bot = new Bot(config);

  - `token` get from [Telegram Bots](https://core.telegram.org/bots)

  - `MARKOV_ORDER` the number of words in each node of the markov chains

  - `CORPUS` file containing the data to be consumed by the text generator
  - `CORPUS_DIGEST` file that will be used to save a snapshot of the generator

  - `BOT_NAME` the name of the bot

  - `MAX_WORDS` the number maximum of words to be generated in each query

## Events

### onCorpusProgress( function(pos, total) )

Emitted each after processing an entry in the corpus

### on( 'message', function(message){} )

Emitted when there's a new update in the bot's queue
See [Telegram Bots' Message type](https://core.telegram.org/bots/api#message)

## Util methods

### Bot.respond(input) - Promise(text)

Generates new text based on `input`. If `input is empty, generates
randomically a new text

### Bot.sendMessage(toId, replyToMsgId, msg) - Promise()

Send a message with text `msg` to the chat id `toId` and in reply to the message id `replyToMsgId` (if available)
You can also use the following scheme

    Bot.sendMessage(toId, msg)

### Bot.sendAudio(toId, replyToMsgId, filePath) - Promise()

Send a message with the audio file `filePath` to the chat id `toId` and in reply to the message id `replyToMsgId` (if available)
You can also use the following scheme

    Bot.sendAudio(toId, filePath)

### Bot.humanDelay(callback)

Calls `callback` after a reasonable amount of time to simulate a human delay.
It needs improvement.

### Bot.schedule(cron, callback)

Schedule `callback` to be executed following the cron-like arguments in `cron`

## Author

- Gustavo Sampaio [@GustavoKatel](https://github.com/GustavoKatel)

## License

See LICENSE file
