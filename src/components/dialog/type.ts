export interface FormDialogComponent {
  /** 手动关闭对话框 */
  hide: () => void;
}

export type DialogButton = {
  /** 对话框中按钮的文本 */
  label: string;
  /** 对话框中按钮触发的事件类型名 */
  actionType?: string;
  /** 对话框中按钮样式类型 */
  class?: string;
};
