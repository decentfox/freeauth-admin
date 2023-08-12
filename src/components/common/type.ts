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
export interface MainMenuSection {
  /** 主菜单分组标题 */
  header: string;
  /** 包含的菜单链接 */
  links: MainMenuLink[];
}

export interface MainMenuLink {
  /** 菜单标题 */
  title: string;
  /** 菜单图标名称 */
  icon: string;
  /** 菜单链接，可空 */
  link?: string;
  /** 菜单权限配置 */
  requiredPerms?: string[];
}

export interface MenuButton {
  /** 菜单按钮文案 */
  label?: string;
  /** 菜单按钮图标 */
  icon?: string;
  /** 菜单按钮触发事件类型 */
  actionType: string;
  /** 菜单按钮是否禁用 */
  disable?: boolean;
  /** 禁用按钮提示信息 */
  disableHint?: string;
}

export interface ChipGroupItem {
  id: string;
  name: string;
}
