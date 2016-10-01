(() => {
  let selectedChannel;

  const backgroundEl = document.getElementById('background');
  const settingsEl = document.getElementById('settings');
  const settingsChannelsEl = document.getElementById('settings-channels');

  function createChannelButton(channel) {
    const button = document.createElement('button');
    button.textContent = channel.name;
    button.classList.add('Settings-channels-button');
    button.setAttribute('data-channel-button', true);
    button.setAttribute('data-id', channel.id);
    button.setAttribute('label', channel.label);

    return button;
  }

  const socket = io('/');
  socket.on('stateChange', channels => {
    backgroundEl.setAttribute(
      'data-state', channels[selectedChannel].state.toLowerCase()
    );
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
        backgroundEl.setAttribute(
          'data-state', channels[selectedChannel].state.toLowerCase()
        );
      });
    });
  });
})();
