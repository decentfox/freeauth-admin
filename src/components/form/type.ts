export type CascadeOption = {
  /** 选项的显示文本 */
  label?: string;
  /** 选项值 */
  value?: string | number;
  /** 包含的子选项 */
  children?: CascadeOption[];
  /** 当前是否被选中 */
  selected?: boolean;
  /** 选项自定义显示文本及选项值 */
  [key: string]: string | number | CascadeOption[] | boolean | undefined;
};
