import electron, { app, BrowserWindow, BrowserWindowConstructorOptions, ipcMain, nativeImage, Point, Size, Tray } from 'electron';

const windowWidth: number = 440;
const windowHeight: number = 270;
const horizontalPadding: number = 15;
const verticalPadding: number = 15;

let isShowWindow: boolean = false;

const getTrayPosition = (): { x: number, y: number; } => {
  const screen = electron.screen;
  const cursorPosition: Point = screen.getCursorScreenPoint();
  const primarySize: Size = screen.getPrimaryDisplay().workAreaSize;
  const trayPositionVertical: string = (cursorPosition.y >= primarySize.height / 2) ? 'bottom' : 'top';
  const trayPositionHorizontal: string = (cursorPosition.x >= primarySize.width / 2) ? 'right' : 'left';

  const getTrayPositionX = (): number => {
    const horizontalBound = {
      left: cursorPosition.x - windowWidth / 2,
      right: cursorPosition.x + windowWidth / 2
    };

    if (trayPositionHorizontal === 'left') {
      return (horizontalBound.left <= horizontalPadding) ? horizontalPadding : horizontalBound.left;
    } else {
      return (horizontalBound.right >= primarySize.width) ? primarySize.width - horizontalPadding - windowWidth : horizontalBound.right - windowWidth;
    }
  };
  const getTrayPositionY = (): number => {
    return (trayPositionVertical === 'bottom') ? cursorPosition.y - windowHeight - verticalPadding : cursorPosition.y + verticalPadding;
  };

  return { x: getTrayPositionX(), y: getTrayPositionY() };
};

const createWindow = () => {
  const windowOptions: BrowserWindowConstructorOptions = {
    width: windowWidth,
    height: windowHeight,
    resizable: false,
    frame: false,
    transparent: true,
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    }
    // backgroundColor: '#000000'
  } as BrowserWindowConstructorOptions;

  const window: BrowserWindow = new BrowserWindow(windowOptions);
  const icon = nativeImage.createFromPath(`${__dirname}/static/images/icon.png`);
  const tray = new Tray(icon);

  tray.setToolTip('출퇴근 도우미 v2');

  tray.on('click', (event) => {
    const trayPosition = getTrayPosition();

    if (isShowWindow) {
      isShowWindow = false;
      window.hide();
    } else {
      isShowWindow = true;
      window.show();
    }

    // console.log('trayPosition :', trayPosition);
    window.setPosition(trayPosition.x, 0);
  });

  window.loadFile(`${__dirname}/static/index.html`);
  // window.webContents.openDevTools();

  window.on('close', () => {
    isShowWindow = false;
    window.close();
  });

  window.on('blur', () => {
    isShowWindow = false;
    window.hide();
  });
};

if (process.platform === 'darwin') {
  app.dock.hide();
}


app.on('ready', createWindow);

// 활성화
ipcMain.on('activate', (event, args) => {
  // console.log('event :', event);
  console.log('args :', args);
});

// 비활성화
ipcMain.on('inactivate', (event, args) => {

});