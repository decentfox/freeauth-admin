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

export interface FormComponent {
  show: () => void;
}

export enum FormAction {
  create = 'create',
  update = 'update',
}
