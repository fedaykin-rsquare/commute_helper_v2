
export const IpcMainEvent = {
  init: 'init',
  login: 'login',
  failLogin: 'failLogin',
  schedule: 'schedule',
  activate: 'activate',
  inactivate: 'inactivate',
  success: 'success',
  fail: 'fail',
  confirm: 'confirm',
} as const;

export const CommuteCommand = {
  start: 'start',
  end: 'end',
} as const;

export const ConfirmCommand = {
  start: 'confirmStart',
  end: 'confirmEnd',
} as const;

export const Selector = {
  companyCode: '#S_C_CD',
  id: '#S_USER_ID',
  password: '#S_PWD',
  login: '#btn_login',
  start: '#S_WORK_STA_BTN',
  end: '#S_WORK_END_BTN',
  modalFrame: '.modalCon iframe',
  save: '.save',
  confirmStart: '#C_IN_HM_DP',
  confirmEnd: '#C_OUT_HM_DP',
  applyList: '#applList',
} as const;

export const Dialog = {
  alert: 'alert',
  confirm: 'confirm',
  prompt: 'prompt',
  beforeunload: 'beforeunload',
} as const;

export const DialogMessage = {
  save: '자료가 저장되었습니다.',
} as const;

export const DialogError = {
  componyCodeError: 'ERR_0030',
  // userIdError: 'ERR_0050',
  passwordError: 'ERR_0080'
} as const;
