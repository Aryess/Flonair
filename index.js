'use strict';

const ATEM = require('applest-atem');
const yargs = require('yargs');
const io = require('socket.io')(2588);

const argv = yargs.argv;
const atem = new ATEM();

const STATES = {
  0: "OFF",
  1: "LIVE",
  2: "PREVIEW",
  3: "LIVE"
};

let channels = {};

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

  console.log(channels);



  atem.on('stateChanged', (err, state) => {
    const tallys = state.tallys.slice(0, -2);


    tallys.forEach((tally, i) => {
      const index = i + 1;
      channels[index].state = STATES[tally];
    });

    io.emit('stateChange', channels);
    console.log(channels);
  });
});
