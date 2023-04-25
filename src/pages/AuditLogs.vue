<template>
  <q-page class="full-width q-pa-md">
    <data-table
      ref="table"
      :columns="columns"
      :rows="rows"
      :filter-columns="filterColumns"
      hide-import
    >
      <template #body-cell-result="props">
        <q-td :props="props">
          <q-chip
            square
            size="12px"
            :label="props.row.result ? '成功' : '失败'"
            class="text-weight-bold q-pa-sm"
            :class="props.row.result ? 'chip-status-on' : 'chip-status-off'"
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
    field: 'event_type',
    sortable: true,
  },
  {
    name: 'username',
    label: '用户名',
    align: 'left',
    field: 'username',
    sortable: true,
  },
  {
    name: 'mobile',
    label: '手机号',
    align: 'left',
    field: 'mobile',
    sortable: true,
  },
  {
    name: 'email',
    label: '邮箱',
    align: 'left',
    field: 'email',
    sortable: true,
  },
  {
    name: 'ip',
    label: 'IP',
    align: 'left',
    field: 'ip',
    sortable: true,
  },
  {
    name: 'device_info',
    label: '设备类型 / 系统',
    align: 'left',
    field: (row) => [row.device, row.os].join(' / '),
    sortable: true,
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
    name: 'result',
    label: '结果',
    align: 'center',
    field: 'result',
    sortable: true,
  },
];

const filterColumns: FilterColumn[] = [
  {
    field: 'event_type',
    label: '事件类型',
    operatorOptions: [FilterOperator.eq, FilterOperator.neq],
    options: [
      { value: 1, label: '注册' },
      { value: 2, label: '登录' },
      { value: 3, label: '登出' },
      { value: 4, label: '修改密码' },
      { value: 5, label: '修改用户名' },
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
    field: 'ip',
    label: 'IP',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.ct,
      FilterOperator.nct,
    ],
  },
  {
    field: 'device',
    label: '设备类型',
    operatorOptions: [FilterOperator.eq, FilterOperator.neq],
    options: [
      { value: 1, label: 'PC' },
      { value: 2, label: 'Mobile' },
      { value: 3, label: 'Unknown' },
    ],
  },
  {
    field: 'os',
    label: '设备系统',
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
    field: 'result',
    label: '结果',
    type: 'select',
    operatorOptions: [FilterOperator.eq, FilterOperator.neq],
    options: [
      { value: false, label: '成功' },
      { value: true, label: '失败' },
    ],
  },
];

const logs = [
  {
    event_type: '登录',
    username: 'daisy',
    mobile: '15901259726',
    email: 'daisy@decentfox.com',
    ip: '127.0.0.1',
    device: 'PC',
    os: 'Windows',
    created_at: Date.now(),
    result: 1,
  },
  {
    event_type: '登出',
    username: 'daisy',
    mobile: '15901259726',
    email: 'daisy@decentfox.com',
    ip: '127.0.0.1',
    device: 'PC',
    os: 'MacOS',
    created_at: Date.now(),
    result: 1,
  },
  {
    event_type: '注册',
    username: 'mico',
    mobile: '15901259723',
    email: 'mico@decentfox.com',
    ip: '127.0.0.1',
    device: 'Mobile',
    os: 'Android',
    created_at: Date.now(),
    result: 0,
  },
];

export default defineComponent({
  name: 'AuditLogs',

  components: { DataTable },

  setup() {
    return {
      columns: columns,
      filterColumns: filterColumns,
      rows: logs,
    };
  },

  methods: {},
});
</script>

<style lang="scss" scoped></style>
