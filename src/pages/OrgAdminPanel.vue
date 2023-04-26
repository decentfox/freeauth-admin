<template>
  <q-page class="full-width">
    <q-splitter
      v-model="splitterModel"
      class="q-py-sm"
      unit="px"
      :limits="[250, 500]"
    >
      <!--the first splitted screen-->
      <template #before>
        <structure-tree editable />
      </template>

      <template #separator>
        <div class="splitter-drag-icon">
          <q-icon name="drag_indicator" color="primary" />
        </div>
      </template>

      <!--the second splitted screen-->
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
              <q-tab name="enterprises" label="企业信息" />
              <q-tab name="users" label="成员列表" />
            </q-tabs>
          </q-toolbar>
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel
              name="enterprises"
              class="scroll q-pa-none frame-table"
              style="height: calc(100vh - 150px)"
            >
              <data-table
                :rows="enterprises"
                :columns="enterpriseColumns"
                sticky-action-column
                :hide-filter="true"
              >
                <template #table-action>
                  <q-btn
                    unelevated
                    dense
                    label="添加企业"
                    class="q-ml-sm q-px-md primary-btn"
                  />
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
                      />
                    </div>
                  </q-td>
                </template>
              </data-table>
            </q-tab-panel>
            <q-tab-panel
              name="users"
              class="scroll q-pa-none frame-table"
              style="height: calc(100vh - 150px)"
            >
              <data-table
                :rows="users"
                :columns="userColumns"
                sticky-action-column
                :hide-filter="true"
              >
                <template #table-filter>
                  <q-checkbox
                    v-model="directDeptCheck"
                    label="仅展示部门的直属成员"
                  />
                </template>
                <template #table-action>
                  <q-btn
                    unelevated
                    dense
                    label="添加成员"
                    class="q-ml-sm q-px-md primary-btn"
                  />
                </template>
                <template #body-cell-depts="props">
                  <q-td :props="props">
                    <q-chip
                      v-for="(dept, idx) in props.row.depts"
                      :key="idx"
                      clickable
                      size="12px"
                      square
                      color="secondary"
                      @click="showRoleCard()"
                    >
                      {{ dept }}
                    </q-chip>
                  </q-td>
                </template>
                <template #body-cell-is_deleted="props">
                  <q-td :props="props">
                    <q-chip
                      square
                      size="12px"
                      :label="!props.row.is_deleted ? '正常' : '禁用'"
                      class="text-weight-bold q-pa-sm"
                      :class="
                        !props.row.is_deleted
                          ? 'chip-status-on'
                          : 'chip-status-off'
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
                            label: !props.row.is_deleted
                              ? '禁用账号'
                              : '启用账号',
                            icon: !props.row.is_deleted
                              ? 'remove_circle_outline'
                              : 'task_alt',
                            actionType: !props.row.is_deleted
                              ? 'disable'
                              : 'enable',
                          },
                          {
                            label: '删除账号',
                            icon: 'delete_outline',
                            actionType: 'delete',
                          },
                        ]"
                      />
                    </div>
                  </q-td>
                </template>
              </data-table>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </template>
    </q-splitter>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { QTableProps } from 'quasar';

import DropdownButton from 'components/DropdownButton.vue';
import StructureTree from 'components/StructureTree.vue';
import DataTable from 'components/table/DataTable.vue';

import { Enterprise, User } from './type';

const userData: User[] = [
  {
    id: '1',
    name: '王伟力',
    mobile: '15701259715',
    username: 'un1',
    depts: ['北京分公司', '成本部门'],
    last_login_at: new Date('2023-01-02T00:00:00.000Z'),
    created_at: new Date('2023-01-01T00:00:00.000Z'),
    is_deleted: false,
  },
  {
    id: '2',
    name: 'Xenia',
    mobile: '15901259713',
    email: 'xenia.lyy@gmail.com',
    username: 'un2',
    depts: ['北京分公司'],
    last_login_at: new Date('2023-01-02T00:00:00.000Z'),
    created_at: new Date('2023-01-01T00:00:00.000Z'),
    is_deleted: false,
  },
  {
    id: '3',
    name: 'Daisy',
    mobile: '15901259715',
    email: 'daichen.daisy@gmail.com',
    username: 'un3',
    depts: ['北京分公司', '产品设计部门'],
    last_login_at: new Date('2023-01-02T00:00:00.000Z'),
    created_at: new Date('2023-01-01T00:00:00.000Z'),
    is_deleted: true,
  },
  {
    id: '4',
    name: '王川',
    mobile: '13801259713',
    username: 'un4',
    depts: ['北京分公司', '产品研发部门'],
    last_login_at: new Date('2023-01-02T00:00:00.000Z'),
    created_at: new Date('2023-01-01T00:00:00.000Z'),
    is_deleted: true,
  },
  {
    id: '5',
    name: 'Mico',
    email: 'mico@decentfox.com',
    username: 'un5',
    depts: ['产品设计部门'],
    last_login_at: new Date('2023-01-02T00:00:00.000Z'),
    created_at: new Date('2023-01-01T00:00:00.000Z'),
    is_deleted: false,
  },
  {
    id: '6',
    name: '王昕',
    mobile: '15901259713',
    username: 'un6',
    depts: ['成本部门'],
    last_login_at: new Date('2023-01-02T00:00:00.000Z'),
    created_at: new Date('2023-01-01T00:00:00.000Z'),
    is_deleted: false,
  },
  {
    id: '7',
    name: '小明',
    mobile: '15701259714',
    username: 'un7',
    depts: ['销售部门'],
    last_login_at: new Date('2023-01-02T00:00:00.000Z'),
    created_at: new Date('2023-01-01T00:00:00.000Z'),
    is_deleted: false,
  },
  {
    id: '8',
    name: '小丽',
    mobile: '15901259712',
    email: 'xen@gmail.com',
    username: 'un8',
    depts: ['销售部门'],
    last_login_at: new Date('2023-01-02T00:00:00.000Z'),
    created_at: new Date('2023-01-01T00:00:00.000Z'),
    is_deleted: false,
  },
  {
    id: '9',
    name: '小红',
    mobile: '15901259711',
    email: 'dai@gmail.com',
    username: 'un9',
    depts: ['销售部门'],
    last_login_at: new Date('2023-01-02T00:00:00.000Z'),
    created_at: new Date('2023-01-01T00:00:00.000Z'),
    is_deleted: true,
  },
  {
    id: '10',
    name: '小青',
    mobile: '13801259710',
    username: 'un10',
    depts: ['销售部门'],
    last_login_at: new Date('2023-01-02T00:00:00.000Z'),
    created_at: new Date('2023-01-01T00:00:00.000Z'),
    is_deleted: false,
  },
  {
    id: '11',
    name: '小方',
    email: 'mico@decent.com',
    username: 'un11',
    depts: ['销售部门'],
    last_login_at: new Date('2023-01-02T00:00:00.000Z'),
    created_at: new Date('2023-01-01T00:00:00.000Z'),
    is_deleted: true,
  },
  {
    id: '12',
    name: '阿强',
    mobile: '15901359713',
    username: 'un12',
    depts: ['成本部门'],
    last_login_at: new Date('2023-01-02T00:00:00.000Z'),
    created_at: new Date('2023-01-01T00:00:00.000Z'),
    is_deleted: false,
  },
];

const enterpriseData: Enterprise[] = [
  {
    id: 1,
    name: '北京分公司',
    taxId: '91110106MA00775P0A',
    bank: '中国工商银行股份有限公司北京天宁寺支行',
    bankId: '0200024809200034233',
    address: '北京经济技术开发区荣华中路19号1号楼B座309',
    tel: '15011592799',
  },
  {
    id: 2,
    name: '上海分公司',
    taxId: '91110108780215415F',
    bank: '中国民生银行股份有限公司上海方庄支行',
    bankId: '0119014170017913',
    address: '上海市大柳树路17号富海中心4号楼10层D东',
    tel: '18518225559',
  },
];

const userColumns: QTableProps['columns'] = [
  {
    name: 'name',
    label: '姓名',
    align: 'left',
    field: 'name',
  },
  {
    name: 'username',
    label: '用户名',
    align: 'left',
    field: 'username',
  },
  {
    name: 'mobile',
    label: '手机号',
    align: 'left',
    field: 'mobile',
  },
  {
    name: 'email',
    label: '邮箱',
    align: 'left',
    field: 'email',
  },
  {
    name: 'depts',
    label: '部门',
    align: 'left',
    field: 'depts',
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

const enterpriseColumns: QTableProps['columns'] = [
  {
    name: 'name',
    label: '企业全称',
    align: 'center',
    field: 'name',
  },
  {
    name: 'taxId',
    label: '纳税识别号',
    align: 'left',
    field: 'taxId',
  },
  {
    name: 'bank',
    label: '开户行',
    align: 'left',
    field: 'bank',
  },
  {
    name: 'bankId',
    label: '银行账号',
    align: 'left',
    field: 'bankId',
  },
  {
    name: 'address',
    label: '办公地址',
    align: 'left',
    field: 'address',
  },
  {
    name: 'tel',
    label: '办公电话',
    align: 'left',
    field: 'tel',
  },
  {
    name: 'actions',
    label: '操作',
    align: 'center',
    field: 'actions',
  },
];

export default defineComponent({
  name: 'OrgAdminPanel',

  components: { DataTable, DropdownButton, StructureTree },

  setup() {
    return {
      // splitter
      splitterModel: 350,

      // table
      tab: ref('enterprises'),
      userColumns: userColumns,
      enterpriseColumns: enterpriseColumns,
      users: userData,
      enterprises: enterpriseData,
      directDeptCheck: ref(true),
    };
  },

  methods: {
    showRoleCard() {
      console.error('role');
    },
  },
});
</script>

<style lang="scss" scoped></style>
