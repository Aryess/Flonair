(() => {
  const background = document.getElementById('background');

  const socket = io('/');
  socket.on('stateChange', channels => {
    background.setAttribute('data-state', channels[1].state.toLowerCase());
  });
})();
