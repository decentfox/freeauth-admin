/*
  Copyright (c) 2016-present DecentFoX Studio and the FreeAuth authors.
  FreeAuth is licensed under Mulan PSL v2.
  You can use this software according to the terms and conditions of the Mulan PSL v2.
  You may obtain a copy of Mulan PSL v2 at:
           http://license.coscl.org.cn/MulanPSL2
  THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
  EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
  MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
  See the Mulan PSL v2 for more details.
*/
export interface FormDialogComponent {
  /** 手动关闭对话框 */
  hide: () => void;
  /** 手动打开对话框 */
  show: () => void;
}

export type DialogButton = {
  /** 对话框中按钮的文本 */
  label: string;
  /** 对话框中按钮触发的事件类型名 */
  actionType?: string;
  /** 对话框中按钮样式类型 */
  class?: string;
};
