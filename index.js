'use strict';

const http = require('http');
const express = require('express');
const ATEM = require('applest-atem');
const yargs = require('yargs');
const socketIo = require('socket.io');
const EventEmitter = require('events').EventEmitter;

class AtemWrapper {
  constructor() {
    this.ee = new EventEmitter;
    this.atem = new ATEM();
    this.state = {};
    this.atem.on('connect', () => {
      this.state = this.atem.state;
      this.ee.emit('connect');
    });
    this.atem.on('stateChanged', (err, state) => {
      this.state = this.atem.state;
      this.ee.emit('stateChanged', err, state);
    });
  }

  on(name, callback) {
    this.ee.on(name, callback);
  }

  connect(ip) { this.atem.connect(ip); }
  changeProgramInput(input, me) { this.atem.changeProgramInput(input, me); }
  changePreviewInput(input, me) { this.atem.changePreviewInput(input, me); }
  changeTransitionPosition(position, me) { this.atem.changeTransitionPosition(position, me); }
  autoTransition(me) { this.atem.autoTransition(me); }
}
class AtemMock {
  constructor() {
    this.ee = new EventEmitter;
    this.state = this.initState();
    this.seed = [0, 2, 1];
  }

  on(name, callback) {
    this.ee.on(name, callback);
  }

  connect(ip) {
    console.log('Connecting to '+ip);
    this.ee.emit('connect');
    setTimeout(() => this.ee.emit('stateChanged', false, this.state), 1000);
    setInterval(() => this.shuffle(), 3000);
  }
  changeProgramInput(input, me) {
    console.log('changeProgramInput');
  }
  changePreviewInput(input, me) {
    console.log('changePreviewInput');
  }
  changeTransitionPosition(position, me) {
    console.log('changeTransitionPosition');
  }
  autoTransition(me) {
    console.log('autoTransition');
  }
  shuffle() {
    for(let i = 0; i<= this.seed.length; i++) {
      this.state.tallys[i] = this.seed[i];
    }
    this.seed.push(this.seed.shift());
    this.ee.emit('stateChanged', false, this.state)
  }
  initState() {
    let state = {};
    const channels = {
      "1": {
        "name": "Fake Sydney Camera 1",
        "label": "SC1"
      },
      "2": {
        "name": "Sydney Camera 2",
        "label": "SC2"
      },
      "3": {
        "name": "Sydney Camera 3",
        "label": "SC3"
      },
      "4": {
        "name": "Sydney GoPro 1",
        "label": "GP1"
      },
      "5": {
        "name": "Sydney GoPro 2",
        "label": "GP2"
      },
      "6": {
        "name": "Sydney GoPro 3",
        "label": "GP3"
      },
      "7": {
        "name": "Skype 1",
        "label": "SKY1"
      },
      "8": {
        "name": "Skype 2",
        "label": "SKY2"
      },
      "9": {
        "name": "Stage Timer",
        "label": "ST"
      },
      "10": {
        "name": "Presentation 2",
        "label": "P2"
      },
      "11": {
        "name": "Sydney Front 1",
        "label": "SF1"
      },
      "12": {
        "name": "HyperDeck 1",
        "label": "HD1"
      },
      "13": {
        "name": "QLab",
        "label": "QLAB"
      },
      "14": {
        "name": "Camera 14",
        "label": "Cm14"
      },
      "15": {
        "name": "Skype 3",
        "label": "SKY3"
      },
      "16": {
        "name": "Skype 4",
        "label": "SKY4"
      },
      "17": {
        "name": "Camera 17",
        "label": "Cm17"
      },
      "18": {
        "name": "Camera 18",
        "label": "Cm18"
      },
      "19": {
        "name": "Camera 19",
        "label": "Cm19"
      },
      "20": {
        "name": "Camera 20",
        "label": "Cm20"
      }
    }

    let tallys = [0,0];
    for (var i = Object.keys(channels).length - 1; i >= 0; i--) {
      tallys.push(0);
    }

    state = {
      "tallys": tallys,
      "channels": channels
    }
    return state
  }
}

const argv = yargs.argv;
const atem = new AtemMock();

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
    socket.emit('test', Object.keys(io.sockets.connected));

    socket.on('message', (message, fn) => {
      io.emit('messageReceived', message);
      fn('OK');
    });
  });

  console.log('We are good to go!');
});

atem.connect(argv.switcherIp);
