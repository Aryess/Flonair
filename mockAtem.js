const EventEmitter = require('events').EventEmitter;

class ATEM {
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

module.exports = ATEM;
