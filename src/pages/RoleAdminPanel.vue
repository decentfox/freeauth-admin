<template>
  <q-page class="full-width">
    <q-tab-panels v-model="panel" animated>
      <q-tab-panel name="table" class="q-pa-md">
        <data-table
          :rows="rows"
          :columns="columns"
          sticky-action-column
          :filter-columns="filterColumns"
          hide-import
          hide-export
        >
          <template #table-action>
            <q-btn
              unelevated
              dense
              label="添加角色"
              class="q-ml-sm q-px-md primary-btn"
            />
            <q-btn
              unelevated
              dense
              icon="account_tree"
              class="q-ml-md"
              @click="panel = 'structure'"
            >
              <q-tooltip>切换视图</q-tooltip>
            </q-btn>
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
                <dropdown-button
                  :buttons="[
                    {
                      label: '删除角色',
                      icon: 'delete_outline',
                      actionType: 'delete',
                    },
                  ]"
                  @menu-click="operateOneRole"
                />
              </div>
            </q-td>
          </template>
        </data-table>
      </q-tab-panel>
      <q-tab-panel name="structure" class="q-pa-none">
        <q-splitter
          v-model="splitterModel"
          class="q-py-sm"
          unit="px"
          :limits="[250, 500]"
        >
          <!--the first splitted screen-->
          <template #before>
            <structure-tree />
          </template>
          <template #separator>
            <div class="splitter-drag-icon">
              <q-icon name="drag_indicator" color="primary" />
            </div>
          </template>
          <template #after>
            <div class="q-px-md q-py-sm">
              <q-toolbar class="q-pa-none">
                <q-tabs
                  v-model="tab"
                  dense
                  class="text-grey-7"
                  active-color="primary"
                  indicator-color="primary"
                  align="left"
                  narrow-indicator
                >
                  <q-tab name="roles" label="角色列表" />
                  <q-tab name="users" label="用户列表" />
                </q-tabs>
                <q-space />
                <q-btn
                  unelevated
                  dense
                  icon="list_alt"
                  class="q-mr-xs"
                  @click="panel = 'table'"
                >
                  <q-tooltip>切换视图</q-tooltip>
                </q-btn>
              </q-toolbar>
            </div>
          </template>
        </q-splitter>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { date, QTableProps } from 'quasar';

import DropdownButton from 'components/DropdownButton.vue';
import StructureTree from 'components/StructureTree.vue';
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
    id: 1,
    name: '管理员',
    code: 'admin',
    belongs_to: ['所有经销商'],
    desc: '系统管理员，拥有最高权限',
    created_at: Date.now(),
    is_deleted: 0,
  },
  {
    id: 2,
    name: '分管领导',
    code: 'leader',
    belongs_to: ['北京公司', '上海公司'],
    created_at: Date.now(),
    is_deleted: 0,
  },
  {
    id: 3,
    name: '项目经理',
    code: 'manager',
    belongs_to: ['北京公司'],
    created_at: Date.now(),
    is_deleted: 1,
  },
];

export default defineComponent({
  name: 'IndexPage',

  components: { DataTable, DropdownButton, StructureTree },

  setup() {
    return {
      // table mode
      columns: columns,
      filterColumns: filterColumns,
      rows: roles,
      panel: ref('table'),

      // structure mode
      splitterModel: 350,
      tab: ref('roles'),
    };
  },

  methods: {
    operateOneRole() {
      console.error('start');
    },
  },
});
</script>

<style lang="scss" scoped></style>
