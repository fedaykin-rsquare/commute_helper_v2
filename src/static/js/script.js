const { ipcRenderer } = require('electron');

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

  idElement.disabled = true;
  passwordElement.disabled = true;
  document.getElementById('activate').style.display = 'none';
  document.getElementById('inactivate').style.display = 'block';
};

const onInactivate = () => {
  ipcRenderer.send('inactivate', false);

  document.getElementById('id').disabled = false;
  document.getElementById('password').disabled = false;
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