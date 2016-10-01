(() => {
  const messageForm = document.getElementById('message-form');

  const socket = io('/');

  messageForm.addEventListener('submit', () => {
    console.log(messageForm);
    socket.emit('message', messageForm.message.value, response => {

    });
  });
})();
