export type Pagination = {
  sortBy: string;
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
