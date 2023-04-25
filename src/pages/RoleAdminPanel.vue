<template>
  <q-page class="full-width q-pa-md">
    <data-table
      ref="table"
      :columns="columns"
      :rows="rows"
      sticky-action-column
      :filter-columns="filterColumns"
      hide-import
      hide-export
    >
      <template #table-action>
        <q-btn unelevated label="创建角色" class="q-ml-md primary-btn" />
      </template>
      <template #body-cell-is_deleted="props">
        <q-td :props="props">
          <q-chip
            square
            size="12px"
            :label="!props.row.is_deleted ? '正常' : '禁用'"
            class="text-weight-bold q-pa-sm"
            :class="
              !props.row.is_deleted ? 'chip-status-on' : 'chip-status-off'
            "
          />
        </q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props">
          <div class="text-grey-8 q-gutter-xs">
            <q-btn
              size="12px"
              flat
              dense
              icon="more_horiz"
              class="text-black-white"
            >
              <q-menu class="q-px-xs">
                <q-list dense>
                  <q-item v-close-popup clickable class="q-my-xs">
                    <q-item-section avatar class="q-pr-none">
                      <q-icon name="delete_outline" size="16px" />
                    </q-item-section>
                    <q-item-section> 删除账号 </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
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
    name: 'name',
    label: '角色名称',
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'code',
    label: '角色代码',
    align: 'left',
    field: 'code',
    sortable: true,
  },
  {
    name: 'desc',
    label: '描述',
    align: 'left',
    field: 'desc',
    sortable: true,
  },
  {
    name: 'belongs_to',
    label: '归属',
    align: 'left',
    field: (row) => row.belongs_to.join('，'),
    sortable: true,
  },
  {
    name: 'created_at',
    label: '创建时间',
    align: 'left',
    field: (row) =>
      date.formatDate(new Date(row.created_at), 'YYYY-MM-DD HH:mm:ss'),
    sortable: true,
  },
  {
    name: 'is_deleted',
    label: '状态',
    align: 'center',
    field: 'is_deleted',
    sortable: true,
  },
  {
    name: 'actions',
    label: '操作',
    align: 'center',
    field: 'actions',
  },
];

const filterColumns: FilterColumn[] = [
  {
    field: 'name',
    label: '角色名称',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.ct,
      FilterOperator.nct,
    ],
  },
];

const roles = [
  {
    name: '管理员',
    code: 'admin',
    belongs_to: ['所有经销商'],
    desc: '系统管理员，拥有最高权限',
    created_at: Date.now(),
    is_deleted: 0,
  },
  {
    name: '分管领导',
    code: 'leader',
    belongs_to: ['北京公司', '上海公司'],
    created_at: Date.now(),
    is_deleted: 0,
  },
  {
    name: '项目经理',
    code: 'manager',
    belongs_to: ['北京公司'],
    created_at: Date.now(),
    is_deleted: 1,
  },
];

export default defineComponent({
  name: 'IndexPage',

  components: { DataTable },

  setup() {
    return {
      columns: columns,
      filterColumns: filterColumns,
      rows: roles,
    };
  },

  methods: {},
});
</script>

<style lang="scss" scoped></style>
