import { ipcMain, Notification } from 'electron';
import puppeteer, { Browser, ElementHandle, Frame, HTTPResponse, Page, WaitForOptions, WaitForSelectorOptions } from 'puppeteer';
import { CommuteCommand, ConfirmCommand, Dialog, DialogError, DialogMessage, IpcMainEvent, Selector } from '../common/common';
import { User } from '../interface/user.interface';
import { CommuteCommandType, ConfirmCommandType, DialogType } from '../type/types';
import notification from '../common/notification';
import { EventArguments } from '../interface/event.interface';

export class CommuteService {
  private browser?: Browser;
  private page?: Page | null = null;
  private readonly jadeUrl: string = 'https://ehr.jadehr.co.kr/';
  private readonly companyCode: string = '2202010';
  // private readonly companyCode: string = '202020202';
  private readonly waitForOptions: WaitForOptions = {
    waitUntil: 'networkidle0',
    timeout: 5000,
  };
  private readonly waitForNavigationOptions: WaitForOptions = {
    timeout: 3000,
  };
  private readonly waitForSelectorOptions: WaitForSelectorOptions = {
    timeout: 5000,
    visible: true
  };
  private count: number = 1;

  constructor () {
  }

  public async launch(): Promise<boolean> {
    console.count('----- You are in launch of commute.service -----');

    try {
      this.browser = await puppeteer.launch({
        headless: false,
        slowMo: 0,
        defaultViewport: {
          width: 1024,
          height: 768,
          deviceScaleFactor: 1,
          isMobile: false,
          hasTouch: false,
          isLandscape: false
        },
        timeout: 5000,
        pipe: false,
        args: [
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--no-sandbox'
        ]
      });

      return true;
    } catch (e: any) {
      if (this.browser) {
        this.browser.close();
      }

      console.error(e);
    }

    return false;
  }

  public async login(user: User): Promise<boolean> {
    console.count('----- You are in login of commute.service -----');

    try {
      this.page = this.browser && await this.browser.newPage();

      if (user && this.page && this.page !== null) {
        const response: HTTPResponse | null = await this.page.goto(this.jadeUrl, this.waitForOptions);

        if (response !== null && response.ok()) {
          this.setDialog();

          const compnayCodeInput: Promise<ElementHandle | null> = this.page.waitForSelector(Selector.companyCode, this.waitForSelectorOptions);
          const idInput: Promise<ElementHandle | null> = this.page.waitForSelector(Selector.id, this.waitForSelectorOptions);
          const passwordInput: Promise<ElementHandle | null> = this.page.waitForSelector(Selector.password, this.waitForSelectorOptions);
          const loginButton: Promise<ElementHandle | null> = this.page.waitForSelector(Selector.login, this.waitForSelectorOptions);

          const [companyCode, id, password, login] = await Promise.all([compnayCodeInput, idInput, passwordInput, loginButton]);

          if (companyCode !== null && id !== null && password !== null && login !== null) {
            await this.page.type(Selector.companyCode, this.companyCode);
            await this.page.type(Selector.id, user.id);
            await this.page.type(Selector.password, user.password);

            const [response] = await Promise.all([this.page.click(Selector.login), this.page.waitForNavigation(this.waitForNavigationOptions)]);
          }
        }
      } else {
        this.count += 1;
        this.login(user);
      }
    } catch (e: any) {
      console.error('login error! :', e);
      await this.close();

      return false;
    }

    return true;
  }

  public async commute(commuteCommand: CommuteCommandType): Promise<boolean> {
    console.count('----- You are in commute of commute.service -----');

    this.setDialog(commuteCommand);

    try {
      if (commuteCommand && this.browser && this.browser !== null && this.page && this.page !== null) {
        const commuteButton: ElementHandle | null = await this.page.waitForSelector(Selector[commuteCommand], this.waitForSelectorOptions);

        if (commuteButton !== null) {
          await this.page.click(Selector[commuteCommand]);

          const applyList: ElementHandle | null = await this.page.waitForSelector(Selector.applyList, this.waitForSelectorOptions);

          console.log('applyList :', applyList);

          if (applyList !== null) {
            await this.page.click(Selector[commuteCommand]);
          }

          const frame: ElementHandle | null = await this.page.waitForSelector(Selector.modalFrame, this.waitForSelectorOptions);

          if (frame !== null) {
            const frameBody: Frame | null = await frame.contentFrame();

            if (frameBody !== null) {
              const saveButton: ElementHandle | null = await frameBody.waitForSelector(Selector.save, this.waitForSelectorOptions);

              if (saveButton !== null) {
                await frameBody.click(Selector.save);

                return true;
              }
            }
          }
        }
      }
    } catch (e: any) {
      console.log('commute error! :', e);
    }

    return false;
  }

  public async confirm(confirmCommand: ConfirmCommandType): Promise<boolean> {
    console.count('----- You are in confirm of commute.service -----');

    if (confirmCommand && this.browser && this.browser !== null && this.page && this.page !== null) {
      const content: string | undefined = await this.page.$eval(Selector[confirmCommand], (element: Element) => {
        return element.textContent?.trim();
      });

      /* ipcMain.emit(IpcMainEvent.confirm, IpcMainEvent.confirm, { confirmCommand: ConfirmCommand.start, commuteTime: '12:00' });

      return true; */

      if (content && content !== '') {
        const match: RegExpMatchArray | null = content.match('(\d{2}):(\d{2})');

        if (match !== null) {
          const emitObj = {
            confirmCommand: confirmCommand,
            commuteTime: match[0],
          } as const;
          ipcMain.emit(IpcMainEvent.confirm, IpcMainEvent.confirm, emitObj);

          return true;
        }
      } else {
        const commuteCommand: CommuteCommandType = confirmCommand === ConfirmCommand.start ? CommuteCommand.start : CommuteCommand.end;

        await this.commute(commuteCommand);
      }
    }

    return false;
  }

  private setDialog(commuteCommand?: CommuteCommandType) {
    if (this.page && this.page !== null) {
      this.page.once('dialog', (dialog) => {
        const dialogType: DialogType = dialog.type();
        const dialogMessage: string = dialog.message().trim();

        if (dialogType === Dialog.confirm) {
          // dialog.accept();
        } else if (dialogType === Dialog.alert) {
          if (dialogMessage === DialogMessage.save) {
            const eventArguments: EventArguments = {
              commuteCommand: commuteCommand || '',
            } as EventArguments;

            ipcMain.emit(IpcMainEvent.success, 'setDialog', eventArguments);
          } else if (dialogMessage.indexOf(DialogError.componyCodeError) >= 0 || dialogMessage.indexOf(DialogError.passwordError) >= 0) {
            // dialog.accept();
            ipcMain.emit(IpcMainEvent.fail, 'setDialog', dialogMessage);
          }
        }

        dialog.accept();
        notification(dialogMessage).show();
      });
    }
  }

  public async canLogin(user: User): Promise<boolean> {
    await this.launch();

    if (this.browser && this.browser !== null) {
      return this.login(user);
    }

    return false;
  }

  public async close(): Promise<boolean> {
    if (this.browser && this.browser !== null && this.page && this.page !== null) {
      await this.page.close();
      await this.browser.close();
      this.browser.disconnect();

      return true;
    }

    return false;
  }
}