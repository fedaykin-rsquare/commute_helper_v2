import { safeStorage } from 'electron';
import { User } from '../interface/user.interface';
import * as fs from 'fs';
import * as path from 'path';

export class UserService {
  private readonly user: User = {} as User;
  private readonly filePath: string = path.join(__dirname, 'user.properties');

  constructor(user: User = {} as User) {
    this.user = user;
  }

  encrypt() {
    if (this.isEmptyUserInfo()) {
      return;
    }

    const encryptedId: Buffer = safeStorage.encryptString(this.user.id);
    const encryptedPassword: Buffer = safeStorage.encryptString(this.user.password);

    console.log('encryptedId :', encryptedId);
    console.log('encryptedPassword :', encryptedPassword);

    fs.writeFileSync(this.filePath, `${encryptedId}|${encryptedPassword}`);

    /* const encrypt: Buffer = safeStorage.encryptString('123');

    // this.user = {} as User;
    console.log('encrypt :', encrypt.toJSON());
    console.log('------------------------------------------');
    console.log('decrypt :', safeStorage.decryptString(Buffer.from(encrypt.toJSON().data))); */
  }

  decrypt(): User | undefined {
    if (this.isEmptyUserInfo()) {
      return;
    }

    const encryptedStringList: Array<string> = fs.readFileSync(this.filePath, { encoding: 'utf-8', flag: 'r' }).split('|');
    const decryptedId: string = safeStorage.decryptString(Buffer.from(encryptedStringList[0]));
    const decryptedPassword: string = safeStorage.decryptString(Buffer.from(encryptedStringList[1]));

    return {
      id: decryptedId,
      password: decryptedPassword,
    } as User;
  }

  private isEmptyUserInfo(): boolean {
    if ((this.user.id && this.user.id !== '') || (this.user.password && this.user.password !== '')) {
      console.error('You can not encrypt about information. cause you have not your user information.');
      return true;
    }

    return false;
  }
}