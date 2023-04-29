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
        <org-structure-tree ref="orgStructure" editable />
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
                    @click="
                      (
                        $refs.orgStructure as OrgTree
                      ).createEnterpriseForm = true
                    "
                  />
                </template>
                <template #body-cell-actions="props">
                  <q-td :props="props">
                    <dropdown-button
                      :buttons="[
                        {
                          label: '编辑信息',
                          icon: 'edit_note',
                          actionType: 'edit',
                        },
                        {
                          label: '删除企业',
                          icon: 'delete_outline',
                          actionType: 'delete',
                        },
                      ]"
                      @menu-click="operateOneEnterprise($event, props.row)"
                    />
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
                api-url="/users/query"
                api-method="POST"
                :columns="userColumns"
                sticky-action-column
                :hide-filter="true"
              >
                <template #extra-filters>
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
import OrgStructureTree from 'components/OrgTree.vue';
import DataTable from 'components/table/DataTable.vue';

import { Enterprise, OrgTree } from './type';

const enterpriseData = [
  {
    id: 1,
    name: '北京分公司',
    tax_id: '91110106MA00775P0A',
    issuing_bank: '中国工商银行股份有限公司北京天宁寺支行',
    bank_account_num: '0200024809200034233',
    contact_address: '北京经济技术开发区荣华中路19号1号楼B座309',
    contact_phone_num: '15011592799',
  },
  {
    id: 2,
    name: '上海分公司',
    tax_id: '91110108780215415F',
    issuing_bank: '中国民生银行股份有限公司上海方庄支行',
    bank_account_num: '0119014170017913',
    contact_address: '上海市大柳树路17号富海中心4号楼10层D东',
    contact_phone_num: '18518225559',
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
    field: 'name',
    align: 'left',
  },
  {
    name: 'tax_id',
    label: '纳税识别号',
    field: 'tax_id',
    align: 'left',
  },
  {
    name: 'issuing_bank',
    label: '开户行',
    field: 'issuing_bank',
    align: 'left',
  },
  {
    name: 'bank_account_num',
    label: '银行账号',
    field: 'bank_account_num',
    align: 'left',
  },
  {
    name: 'contact_address',
    label: '办公地址',
    field: 'contact_address',
    align: 'left',
  },
  {
    name: 'contact_phone_num',
    label: '办公电话',
    field: 'contact_phone_num',
    align: 'left',
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

  components: { DataTable, DropdownButton, OrgStructureTree },

  setup() {
    return {
      // splitter
      splitterModel: 350,

      // table
      tab: ref('enterprises'),
      userColumns: userColumns,
      enterpriseColumns: enterpriseColumns,
      enterprises: enterpriseData,
      directDeptCheck: ref(false),
    };
  },

  methods: {
    showRoleCard() {
      console.error('role');
    },

    operateOneEnterprise(evt: Event, enterprise: Enterprise) {
      if (evt.type === 'edit') {
        (this.$refs.orgStructure as OrgTree).createEnterpriseForm = true;
      } else if (evt.type === 'delete') {
        (this.$refs.orgStructure as OrgTree).deleteBranch({
          enterpriseId: enterprise.id,
          label: enterprise.name,
        });
      }
    },
  },
});
</script>

<style lang="scss" scoped></style>
