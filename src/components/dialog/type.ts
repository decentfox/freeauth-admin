export interface FormDialogComponent {
  /** 手动关闭对话框 */
  hide: () => void;
}

export type DialogButton = {
  /** 选项的显示文本 */
  label: string;
  actionType?: string;
  class?: string;
};
