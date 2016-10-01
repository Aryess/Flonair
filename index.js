'use strict';

const http = require('http');
const express = require('express');
const ATEM = require('applest-atem');
const yargs = require('yargs');
const socketIo = require('socket.io');

const argv = yargs.argv;
const atem = new ATEM();

const STATES = {
  0: "OFF",
  1: "LIVE",
  2: "PREVIEW",
  3: "LIVE"
};


let channels = {};


const app = express();
const server = http.Server(app);
const io = socketIo(server);
server.listen(2588);

app.all('/static/*', (req, res, next) => {
  res.sendFile(`${__dirname}/app/static/${req.params[0]}`);
})

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/app/index.html`);
});

app.get('/control-panel', (req, res) => {
  res.sendFile(`${__dirname}/app/control-panel.html`);
})

app.get('/qlab/intro/start', (req, res) => {
  res.sendStatus(200);
  // Change the program input to Town Hall countdown.
  atem.changeProgramInput(13);
  atem.changeProgramInput(13, 1);

  // Overlay the GoPro 1 view behind the countdown for a sleek view.
  atem.changePreviewInput(4);
  atem.changePreviewInput(4, 1);

  // Set the transition to overlay.
  // TODO: Fade this in?
  atem.changeTransitionPosition(2000);
  atem.changeTransitionPosition(2000, 1);
});

app.get('/qlab/intro/record', (req, res) => {
  res.sendStatus(200);

  // TODO: Fade this in?
  atem.changeTransitionPosition(0);
  atem.changeTransitionPosition(0, 1);

  // Prepare for the MC and Manila
  atem.changePreviewInput(1);
  atem.changePreviewInput(7, 1);
});

app.get('/transition/:val', (req, res) => {
  res.sendStatus(200);
  atem.changeTransitionPosition(req.params.val);
});

app.get('/qlab/intro/stop', (req, res) => {
  res.sendStatus(200);
  atem.autoTransition();
  atem.autoTransition(1);
});

app.get('/qlab/stinger/start', (req, res) => {
  res.sendStatus(200);
  atem.changePreviewInput(13);
  atem.autoTransition();
  atem.changePreviewInput(13, 1);
  atem.autoTransition(1);
});

app.get('/qlab/stinger/stop', (req, res) => {
  res.sendStatus(200);
  atem.autoTransition();
  atem.autoTransition(1);
});


app.get('/state', (req, res) => {
  res.json(channels);
})

atem.connect(argv.switcherIp);

atem.on('connect', () => {
  const tallyNumber = atem.state.tallys.length - 2;

  // Cut the channels so we have only as much as the tallies to map it on a
  // 1-1.
  channels = Object.keys(atem.state.channels).reduce((channelList, channel) => {
    const channelNumber = parseInt(channel, 10);
    // If the channel number is bigger than the tally list then don't include it
    // Also if it is black (normally on channel 0)
    if (channelNumber <= tallyNumber && channelNumber > 0) {
      channelList[channelNumber] =
        Object.assign({}, atem.state.channels[channel], {
          id: channelNumber,
          state: STATES[0],
        });
    }

    return channelList;
  }, {});


  atem.on('stateChanged', (err, state) => {
    const tallys = state.tallys.slice(0, -2);


    tallys.forEach((tally, i) => {
      const index = i + 1;
      channels[index].state = STATES[tally];
    });

    io.emit('stateChange', channels);
  });

  io.on('connection', socket => {
    socket.emit('setup', channels);

    socket.on('message', (message, fn) => {
      io.emit('messageReceived', message);
      fn('OK');
    });
  });

  console.log('We are good to go!');
});
