export type Pagination = {
  sortBy?: string;
  descending: boolean;
  page: number;
  last: number;
  rowsPerPage: number;
  rowsNumber: number;
};

export type FilterCondition = {
  field: string | null;
  operator: string | null;
  value: string | null;
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
