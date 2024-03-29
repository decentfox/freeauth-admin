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
import { Application } from '../application/type';
import { Enterprise } from '../organization/type';
import { Permission } from '../permission/type';
import { Role } from '../role/type';
import { User } from '../user/type';

export interface DataTableComponent {
  /** 基于当前搜索、筛选、排序、分页参数，手动触发获取数据的请求 */
  fetchRows: () => void;
  /** 清空表格，重置至初始状态 */
  clearRows: () => void;
  /** 设置获取表格数据的 API 信息 */
  setApiInfo: (apiUrl: string, apiMethod: string) => void;
  /** 基于外部传入的过滤键值，对表格数据进行过滤 */
  onExternalFiltered: (key: string, value: string | boolean | string[]) => void;
  /** 移除外部传入的过滤键值，取消对该字段的过滤 */
  removeExternalFilter: (key: string) => void;
  /** 释放所有勾选行 */
  resetSelected: () => void;
  /** 表格中的数据 */
  rows: Permission[] | Enterprise[] | User[] | Application[] | Role[];
}

export type Pagination = {
  sortBy?: string;
  descending: boolean;
  page: number;
  last: number;
  rowsPerPage: number;
  rowsNumber: number;
};

export type FilterCondition = {
  /** 筛选条件字段标识 */
  field?: string;
  /** 当前选中的运算符 */
  operator?: string;
  /** 当前填写或选择的参数值 */
  value?: string;
};

export enum FilterOperator {
  eq = 'eq',
  neq = 'neq',
  gt = 'gt',
  gte = 'gte',
  lt = 'lt',
  lte = 'lte',
  ct = 'ct',
  nct = 'nct',
}

export const FilterOperatorMap = {
  [FilterOperator.eq]: '等于',
  [FilterOperator.neq]: '不等于',
  [FilterOperator.gt]: '大于',
  [FilterOperator.gte]: '大于等于',
  [FilterOperator.lt]: '小于',
  [FilterOperator.lte]: '小于等于',
  [FilterOperator.ct]: '包含',
  [FilterOperator.nct]: '不包含',
};

export type FilterColumnOption = {
  value: string | number | boolean;
  label: string;
};

export type FilterColumn = {
  /** 筛选条件字段标识 */
  field: string;
  /** 筛选条件字段名称 */
  label: string;
  /** 支持的运算符（默认支持全部运算符，设置后将覆盖默认选项） */
  operatorOptions?: FilterOperator[];
  /** 筛选值类型，默认为 input 输入框 */
  type?: string;
  /** 筛选条件选项，当 type 为 select，需提供此参数，可下拉选择数值 */
  options?: FilterColumnOption[];
};

export type QueryData = {
  /** 搜索关键字 */
  q?: string;
  /** 筛选条件 */
  filter_by?: FilterCondition[];
  /** 排序字段 */
  order_by?: string[];
  /** 分页页码 */
  page?: number;
  /** 分页大小 */
  per_page?: number;
  [index: string]: unknown;
};
