'use strict';

(() => {
  const settingsChannelsEl = document.getElementById('settings-channels');
  const settingsMessagesEl = document.getElementById('canned');
  const messageForm = document.getElementById('message-form');
  const formInput = document.getElementById('form-message');
  const cannedMessages = [
  	{id: 1, label: 'too dark'},
  	{id: 2, label: 'too bright'},
  	{id: 3, label: 'out of focus'},
  	{id: 4, label: 'out of frame'}
  ];
  let receivers = [];
  let messages = [];
  let chans = {};
  const socket = io('/');

  function createChannelButton(channel) {
    const button = document.createElement('button');
    button.textContent = channel.name;
    button.classList.add('Settings-channels-button');
    button.setAttribute('data-channel-button', true);
    button.setAttribute('data-id', channel.id);
    button.setAttribute('label', channel.label);

    return button;
  }

  function createMessageButton(message) {
    const button = document.createElement('button');
    button.textContent = message.label;
    button.classList.add('Settings-messages-button');
    button.setAttribute('data-message-button', true);
    button.setAttribute('data-id', message.id);
    button.setAttribute('label', message.label);

    return button;
  }

 function refreshForm() {
 	console.log('ok');
 		formInput.value = receivers.filter(function(d,i){return receivers.indexOf(d)==i}).join() + ': ' + messages.filter(function(d,i){return messages.indexOf(d)==i}).join();
 }

  cannedMessages.forEach(message => {
  	const button = createMessageButton(message);
    settingsMessagesEl.appendChild(button);
  });

  const messageButtons = Array.from(
	    document.querySelectorAll('[data-message-button]')
	  );

		messageButtons.forEach(messageButton => {
      messageButton.addEventListener('click', (e) => {
        messages.push(e.target.getAttribute('label'));
        refreshForm();
        console.log(messages);
      });
  	});


	socket.on('setup', channels => {
  	chans = channels;
  	Object.keys(channels).forEach(channel => {
      const button = createChannelButton(channels[channel]);
      settingsChannelsEl.appendChild(button);
    }); 

    const channelButtons = Array.from(
	    document.querySelectorAll('[data-channel-button]')
	  );

		channelButtons.forEach(channelButton => {
      channelButton.addEventListener('click', (e) => {
        receivers.push(e.target.getAttribute('label'));
        refreshForm();
        console.log(receivers);
      });
  	});
  });



  messageForm.addEventListener('submit', () => {
    console.log(messageForm);
    receivers = [];
    messages = [];
    socket.emit('message', messageForm.message.value, response => {

    });
  });
})();
