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
  field: string | null;
  /** 当前选中的运算符 */
  operator: string | null;
  /** 当前填写或选择的参数值 */
  value: string | null;
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
};
