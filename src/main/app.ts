import electron, { app, BrowserWindow, BrowserWindowConstructorOptions, ipcMain, NativeImage, nativeImage, Point, powerMonitor, powerSaveBlocker, Size, Tray } from 'electron';
import * as fs from 'fs';
import { IpcMainEvent } from './common/common';
import { User } from './interface/user.interface';
import { IpcMainService } from './service/ipc.main.service';
import { UserService } from './service/user.service';

const windowWidth: number = 840; // 440
const windowHeight: number = 370;
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
  const iconFile: Buffer = fs.readFileSync(`${__dirname}/static/images/jade-icon.png`);
  const iconImage: NativeImage = nativeImage.createFromBuffer(iconFile, { scaleFactor: 20 });
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
    },
    icon: iconImage
    // backgroundColor: '#000000'
  } as BrowserWindowConstructorOptions;

  const window: BrowserWindow = new BrowserWindow(windowOptions);
  const tray: Tray = new Tray(iconImage);

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
  window.webContents.on('did-finish-load', () => {
    const user: User | undefined = new UserService().decrypt();

    window.webContents.send(IpcMainEvent.init, user);

    if (user) {
      window.webContents.send(IpcMainEvent.login);
    }
  });
  window.webContents.openDevTools();

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
  // app.dock.hide();
}



app.on('ready', () => {
  createWindow();

  powerMonitor.on('suspend', () => {
    const blockerId: number = powerSaveBlocker.start('prevent-app-suspension');

    console.log('blockerId on suspend in powerMonitor :', blockerId);
  });

  powerMonitor.on('resume', () => {
    console.log('resume in powerMonitor!');
    ipcMain.emit(IpcMainEvent.schedule);
  });

  powerMonitor.on('lock-screen', () => {
    console.log('lock-screen in powerMonitor!');
  });

  powerMonitor.on('unlock-screen', () => {
    console.log('unlock-screen in powerMonitor!');
    ipcMain.emit(IpcMainEvent.schedule);
  });
});

const ipcMainService: IpcMainService = new IpcMainService();