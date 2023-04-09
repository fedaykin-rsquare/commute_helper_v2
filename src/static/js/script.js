const { ipcRenderer } = require('electron');

window.onload = () => {
  ipcRenderer.on('init', (event, args) => {
    const { id, password } = args;

    if (id && id !== '' && password && password !== '') {
      disable();
      document.getElementById('id').value = id;
      document.getElementById('password').value = password;
      ipcRenderer.send('login');
    }
  });

  ipcRenderer.on('failLogin', (event, args) => {
    enable();
  });
};

const onActivate = () => {
  const idElement = document.getElementById('id');
  const passwordElement = document.getElementById('password');
  const user = {
    id: idElement.value.trim(),
    password: passwordElement.value.trim(),
  };

  if (user.id === '') {
    alert('아이디를 입력해주세요!');
    idElement.focus();
    return;
  }

  if (user.password === '') {
    alert('비밀번호를 입력해주세요!');
    passwordElement.focus();
    return;
  }

  // console.log('user :', user);

  ipcRenderer.send('activate', user);

  disable();
};

const onInactivate = () => {
  ipcRenderer.send('inactivate', false);

  enable();
};

const disable = () => {
  document.getElementById('id').disabled = true;
  document.getElementById('password').disabled = true;
  document.getElementById('end').disabled = false;
  document.getElementById('activate').style.display = 'none';
  document.getElementById('inactivate').style.display = 'block';
};

const enable = () => {
  document.getElementById('id').disabled = false;
  document.getElementById('password').disabled = false;
  document.getElementById('end').disabled = true;
  document.getElementById('activate').style.display = 'block';
  document.getElementById('inactivate').style.display = 'none';
}


/* var ipc = require('electron').ipcRenderer;
var authButton = document.getElementById('auth-button');
authButton.addEventListener('click', function(){
    ipc.once('actionReply', function(event, response){
        processResponse(response);
    })
    ipc.send('invokeAction', 'someData');
}); */