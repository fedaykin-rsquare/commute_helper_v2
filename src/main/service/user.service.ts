import { safeStorage } from 'electron';
import { User } from '../interface/user.interface';
import * as fs from 'fs';
import * as path from 'path';

export class UserService {
  private readonly filePath: string = path.join(__dirname, 'user.properties');

  constructor() {
  }

  public encrypt(user: User) {
    const encryptedString: Buffer = safeStorage.encryptString(`${user.id}|${user.password}`);

    fs.writeFileSync(this.filePath, encryptedString.toString('base64'));
  }

  public decrypt(): User | undefined {
    try {
      const encryptedString: string = fs.readFileSync(this.filePath, { encoding: 'utf-8', flag: 'r' });
      const decryptedStringList: Array<string> = safeStorage.decryptString(Buffer.from(encryptedString, 'base64')).split('|');

      return {
        id: decryptedStringList[0],
        password: decryptedStringList[1],
      } as User;
    } catch (e: any) {
      console.error(e);
    }
  }

  public remove(): boolean {
    try {
      fs.writeFileSync(this.filePath, '');
    } catch (e: any) {
      return false;
    }

    return true;
  }

  public getUserInfo(): User | undefined {
    const user: User | undefined = this.decrypt();

    return user;
  }

  /* private isEmptyUserInfo(): boolean {
    if ((!this.user.id || this.user.id === '') || (!this.user.password || this.user.password === '')) {
      console.error('You can not encrypt about information. cause you have not your user information.');
      return true;
    }

    return false;
  } */
}