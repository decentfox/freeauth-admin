<template>
  <page-wrapper page-title="审计日志">
    <data-table
      ref="table"
      :columns="columns"
      api-url="/audit_logs/query"
      api-method="POST"
      :filter-columns="filterColumns"
      search-placeholder="搜索用户信息、IP地址"
      hide-import
    >
      <template #body-cell-is_succeed="props">
        <q-td :props="props">
          <q-chip
            square
            size="12px"
            :label="props.row.is_succeed ? '成功' : '失败'"
            class="text-weight-bold q-pa-sm q-ml-none"
            :class="props.row.is_succeed ? 'chip-status-on' : 'chip-status-off'"
          />
        </q-td>
      </template>
    </data-table>
  </page-wrapper>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { date, QTableProps } from 'quasar';

import { FilterColumn, FilterOperator } from 'components/table/type';

enum EventType {
  SignIn = 'SignIn',
  SignOut = 'SignOut',
  SignUp = 'SignUp',
}

const EventTypeMap = {
  [EventType.SignIn]: '登录',
  [EventType.SignOut]: '登出',
  [EventType.SignUp]: '注册',
};

const columns: QTableProps['columns'] = [
  {
    name: 'event_type',
    label: '事件类型',
    align: 'left',
    field: (row) => EventTypeMap[row.event_type as EventType],
    sortable: true,
  },
  {
    name: 'username',
    label: '用户名',
    align: 'left',
    field: (row) => row.user.username,
  },
  {
    name: 'mobile',
    label: '手机号',
    align: 'left',
    field: (row) => row.user.mobile,
  },
  {
    name: 'email',
    label: '邮箱',
    align: 'left',
    field: (row) => row.user.email,
  },
  {
    name: 'client_ip',
    label: 'IP',
    align: 'left',
    field: 'client_ip',
  },
  {
    name: 'device_info',
    label: '设备信息',
    align: 'left',
    field: (row) => [row.device, row.os, row.browser].join(' / '),
  },
  {
    name: 'created_at',
    label: '操作时间',
    align: 'left',
    field: (row) =>
      date.formatDate(new Date(row.created_at), 'YYYY-MM-DD HH:mm:ss'),
    sortable: true,
  },
  {
    name: 'is_succeed',
    label: '结果',
    align: 'center',
    field: 'is_succeed',
    sortable: true,
  },
];

const filterColumns: FilterColumn[] = [
  {
    field: 'event_type',
    label: '事件类型',
    type: 'select',
    operatorOptions: [FilterOperator.eq, FilterOperator.neq],
    options: Object.entries(EventTypeMap).map(([value, label]) => ({
      value,
      label,
    })),
  },
  {
    field: 'user.username',
    label: '用户名',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.ct,
      FilterOperator.nct,
    ],
  },
  {
    field: 'user.mobile',
    label: '手机号',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.ct,
      FilterOperator.nct,
    ],
  },
  {
    field: 'user.email',
    label: '邮箱',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.ct,
      FilterOperator.nct,
    ],
  },
  {
    field: 'client_ip',
    label: 'IP 地址',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.ct,
      FilterOperator.nct,
    ],
  },
  {
    field: 'device',
    label: '设备',
    operatorOptions: [FilterOperator.ct, FilterOperator.nct],
  },
  {
    field: 'os',
    label: '操作系统',
    operatorOptions: [FilterOperator.ct, FilterOperator.nct],
  },
  {
    field: 'browser',
    label: '浏览器',
    operatorOptions: [FilterOperator.ct, FilterOperator.nct],
  },
  {
    field: 'created_at',
    label: '操作时间',
    type: 'datetime',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.gt,
      FilterOperator.gte,
      FilterOperator.lt,
      FilterOperator.lte,
    ],
  },
  {
    field: 'is_succeed',
    label: '结果',
    type: 'select',
    operatorOptions: [FilterOperator.eq, FilterOperator.neq],
    options: [
      { value: true, label: '成功' },
      { value: false, label: '失败' },
    ],
  },
];

export default defineComponent({
  name: 'AuditLogs',

  setup() {
    return {
      columns: columns,
      filterColumns: filterColumns,
    };
  },
});
</script>

<style lang="scss" scoped></style>
