<template>
  <q-page class="full-width q-pa-md">
    <data-table
      ref="table"
      :columns="columns"
      api-url="/audit_logs/query"
      api-method="POST"
      :filter-columns="filterColumns"
      hide-import
    >
      <template #body-cell-status_code="props">
        <q-td :props="props">
          <q-chip
            square
            size="12px"
            :label="props.row.status_code === 200 ? '成功' : '失败'"
            class="text-weight-bold q-pa-sm"
            :class="
              props.row.status_code === 200
                ? 'chip-status-on'
                : 'chip-status-off'
            "
          />
        </q-td>
      </template>
    </data-table>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { date, QTableProps } from 'quasar';

import DataTable from 'components/table/DataTable.vue';
import { FilterColumn, FilterOperator } from 'components/table/type';

const columns: QTableProps['columns'] = [
  {
    name: 'event_type',
    label: '事件类型',
    align: 'left',
    field: (row) =>
      row.event_type.toLowerCase() === 'signup'
        ? '注册'
        : row.event_type.toLowerCase() === 'signout'
        ? '登出'
        : row.event_type.toLowerCase() === 'signin'
        ? '登录'
        : '',
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
    name: 'status_code',
    label: '结果',
    align: 'center',
    field: 'status_code',
    sortable: true,
  },
];

const filterColumns: FilterColumn[] = [
  {
    field: 'event_type',
    label: '事件类型',
    operatorOptions: [FilterOperator.eq, FilterOperator.neq],
    options: [
      { value: 'signup', label: '注册' },
      { value: 'signin', label: '登录' },
      { value: 'signout', label: '登出' },
    ],
  },
  {
    field: 'username',
    label: '用户名',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.ct,
      FilterOperator.nct,
    ],
  },
  {
    field: 'mobile',
    label: '手机号',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.ct,
      FilterOperator.nct,
    ],
  },
  {
    field: 'email',
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
      { value: false, label: '成功' },
      { value: true, label: '失败' },
    ],
  },
];

export default defineComponent({
  name: 'AuditLogs',

  components: { DataTable },

  setup() {
    return {
      columns: columns,
      filterColumns: filterColumns,
    };
  },

  methods: {},
});
</script>

<style lang="scss" scoped></style>
