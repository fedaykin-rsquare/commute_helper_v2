import { NativeImage, Notification, nativeImage } from 'electron';

const notification = (body: string, status?: 'success' | 'fail'): Notification => {
  const iconPath: string = `${process.cwd()}/dist/static/images/jade-tray-icon.png`;
  const iconImage: NativeImage = nativeImage.createFromPath(iconPath);

  return new Notification({
    title: 'RSQUARE 출퇴근 도우미 V2',
    body,
    icon: iconImage,
  });
};

export default notification;