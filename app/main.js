(() => {
  const background = document.getElementById('background');

  const socket = io('http://localhost:2588');
  socket.on('stateChange', channels => {
    background.setAttribute('data-state', channels[1].state.toLowerCase());
  });
})();
