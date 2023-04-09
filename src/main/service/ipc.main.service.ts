import { ipcMain } from 'electron';
import { CommuteCommand, ConfirmCommand, IpcMainEvent } from '../common/common';
import dayjs from '../common/dayjs';
import notification from '../common/notification';
import { EventArguments } from '../interface/event.interface';
import { User } from '../interface/user.interface';
import { CommuteService } from './commute.service';
import { UserService } from './user.service';

export class IpcMainService {
  public commuteService: CommuteService = new CommuteService();
  public userService: UserService = new UserService();
  public activate: boolean = false;
  public loggedIn: boolean = false;
  public success: boolean = false;
  public close: boolean = false;
  public startTime?: dayjs.Dayjs;
  public endTime?: dayjs.Dayjs;

  constructor () {
    // 활성화
    ipcMain.on(IpcMainEvent.activate, (event, args) => {
      this.activate = true;
      const { id, password } = args;

      this.userService.encrypt({ id, password });
      ipcMain.emit(IpcMainEvent.login, IpcMainEvent.activate);
    });

    // 로그인 가능 여부 체크
    ipcMain.on(IpcMainEvent.login, async (event, args) => {
      console.log('event in IpcMainEvent.login :', event);
      console.log('args in IpcMainEvent.login :', args);
      console.log('-----------------------------------------');
      const user: User | undefined = this.userService.decrypt();

      console.log('user in IpcMainEvent.login :', user);

      if (user) {
        this.loggedIn = await this.commuteService.canLogin(user);

        if (this.loggedIn) {
          const confirm: boolean = await this.commuteService.confirm(ConfirmCommand.start);

          // console.log('confirm :', confirm);

          ipcMain.emit(IpcMainEvent.schedule, IpcMainEvent.login);
        } else {
          event.sender.send(IpcMainEvent.failLogin);
        }
      }

      console.log('loggedIn in IpcMainEvent.login :', this.loggedIn);
    });

    // 스케쥴 시작
    ipcMain.on(IpcMainEvent.schedule, async (event, args) => {
      console.log('event in IpcMainEvent.schedule :', event);
      console.log('args in IpcMainEvent.schedule :', args);

      if (this.loggedIn) {
        const schedule = async () => {
          const now: dayjs.Dayjs = dayjs();

          // 날이 바뀌었다면,,
          if (now.diff(this.startTime, 'day') > 0) {
            this.success = false;
            this.startTime = undefined;
            this.endTime = undefined;

            const commute: boolean = await this.commuteService.commute(CommuteCommand.start);

            console.log('commute in schedule :', commute);
          } else if (this.endTime === undefined) { // 출근 후 8시간이 지났다면,,
            const commute: boolean = await this.commuteService.commute(CommuteCommand.end);

            console.log('commute in schedule :', commute);
          }
        };

        // 8시간 마다 스케쥴 실행
        setInterval(schedule, 8 * 60 * 60 * 1000);
      }
    });

    // 비활성화
    ipcMain.on(IpcMainEvent.inactivate, (event, args) => {
      this.activate = false;
      this.userService.remove();
    });

    // 성공
    ipcMain.on(IpcMainEvent.success, (event, args: EventArguments) => {
      this.success = true;
      console.log('event in IpcMainEvent.success :', event);
      console.log('args in IpcMainEvent.success :', args);

      if (args.commuteCommand === CommuteCommand.start) {
        this.startTime = dayjs();
      } else if (args.commuteCommand === CommuteCommand.end) {
        this.endTime = dayjs();
      }

      this.commuteService.close();
    });

    // 실패
    ipcMain.on(IpcMainEvent.fail, (event, args) => {
      this.success = false;

      notification(args, 'fail').show();
      this.commuteService.close();
    });

    // 확인
    ipcMain.on(IpcMainEvent.confirm, (event, args) => {
      console.log('event in IpcMainEvent.confirm :', event);
      console.log('args in IpcMainEvent.confirm :', args);

      const { confirmCommand, commuteTime } = args;
      const now: dayjs.Dayjs = dayjs();
      const timeArr: Array<string> = commuteTime.split(':');

      now.set('hour', Number(timeArr[0]));
      now.set('minute', Number(timeArr[1]));

      if (confirmCommand === ConfirmCommand.start) {
        this.startTime = now;
        this.success = true;
      } else if (confirmCommand === ConfirmCommand.end) {
        this.endTime = now;
        this.success = true;
      }
    });
  }

}