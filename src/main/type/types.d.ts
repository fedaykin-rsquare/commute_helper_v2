import { CommuteCommand, ConfirmCommand, Selector, Dialog, DialogMessage, IpcMainEvent } from '../common/common';
import { Selector } from '../common/selector';

export type IpcMainEventType = typeof IpcMainEvent[keyof typeof IpcMainEvent];
export type CommuteCommandType = typeof CommuteCommand[keyof typeof CommuteCommand];
export type ConfirmCommandType = typeof ConfirmCommand[keyof typeof ConfirmCommand];
export type SelectorType = typeof Selector[keyof typeof Selector];
export type DialogType = typeof Dialog[keyof typeof Dialog];
export type DialogMessageType = typeof DialogMessage[keyof typeof DialogMessage];