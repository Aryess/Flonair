'use strict';

(() => {
  let selectedChannel;

  const backgroundEl = document.getElementById('background');
  const settingsEl = document.getElementById('settings');
  const settingsChannelsEl = document.getElementById('settings-channels');
  const settingsToggleEl = document.getElementById('settings-toggle');
  const channelLabelEl = document.getElementById('channel-label');
  const messageEl = document.getElementById('message');

  function createChannelButton(channel) {
    const button = document.createElement('button');
    button.textContent = channel.name;
    button.classList.add('Settings-channels-button');
    button.setAttribute('data-channel-button', true);
    button.setAttribute('data-id', channel.id);
    button.setAttribute('label', channel.label);

    return button;
  }

  function popMessage(message, duration = 5000) {
    messageEl.textContent = message;
    messageEl.classList.add('is-active');

    setTimeout(() => {
      messageEl.classList.remove('is-active');
    }, duration);
  }

  function switchChannel(channel) {
    backgroundEl.setAttribute(
      'data-state', channel.state.toLowerCase()
    );

    channelLabelEl.textContent = channel.label;
  }

  const socket = io('/');
  socket.on('stateChange', channels => {
    switchChannel(channels[selectedChannel]);
  });

  socket.on('messageReceived', data => {
    console.log(data);
    popMessage(data, 5000);
  });

  socket.on('setup', channels => {
    Object.keys(channels).forEach(channel => {
      const button = createChannelButton(channels[channel]);
      settingsChannelsEl.appendChild(button);
    });


    const channelButtons = Array.from(
      document.querySelectorAll('[data-channel-button]')
    );

    channelButtons.forEach(channelButton => {
      channelButton.addEventListener('click', (e) => {
        selectedChannel = e.target.getAttribute('data-id');
        settingsEl.classList.add('is-hidden');
        fetch('/state')
          .then(response => response.json())
          .then(channels => switchChannel(channels[selectedChannel]));
      });
    });

    settingsToggleEl.addEventListener('click', e => {
      settingsEl.classList.toggle('is-hidden');
    });
  });

  socket.on('disconnect', () => {
    console.log('DISCONNECT');
  });

  socket.on('connect', () => {
    console.log('CONNECT');
  })
})();
