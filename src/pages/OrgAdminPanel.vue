<template>
  <div style="min-width: 1060px">
    <q-splitter
      v-model="splitterModel"
      class="q-py-sm"
      unit="px"
      :limits="[250, 500]"
    >
      <!--the first splitted screen-->
      <template #before>
        <div class="q-px-md q-py-sm">
          <q-toolbar class="q-pa-none">
            <q-select
              ref="select"
              v-model="currentOrgType"
              :popup-content-style="`width: ${width}px; word-break: break-all;`"
              style="word-break: break-all"
              dense
              filled
              class="full-width"
              :options="orgTypeOptions"
              @popup-show="width = ($refs.select as QSelect).$el.offsetWidth"
              @update:model-value="changeOrgType"
            >
              <template #before-options>
                <q-item clickable>
                  <q-item-section>
                    <q-item-label caption lines="1">
                      <q-icon name="add" />
                      添加组织类型
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
              </template>
              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption lines="1">
                      {{ scope.opt.desc }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-toolbar>
          <q-separator spaced="sm" />

          <q-toolbar class="q-pa-none">
            <q-input
              ref="filterRef"
              v-model="filter"
              dense
              filled
              debounce="300"
              placeholder="搜索组织"
              class="full-width"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
              <template #append>
                <q-icon
                  v-if="filter !== ''"
                  name="close"
                  size="xs"
                  class="cursor-pointer"
                  @click="resetOrgFilter"
                />
              </template>
            </q-input>
            <q-space />
            <q-btn
              unelevated
              class="q-ml-sm secondary-btn"
              label="创建"
              style="width: 75px; height: 40px"
            >
              <q-tooltip>新增组织</q-tooltip>
            </q-btn>
          </q-toolbar>
          <q-tab-panel
            name="structure"
            class="scroll q-px-none"
            style="height: calc(100vh - 200px)"
          >
            <q-tree
              ref="orgTree"
              v-model:selected="selected"
              :nodes="simple"
              node-key="id"
              selected-color="white"
              :filter="filter"
              default-expand-all
            >
              <template #default-header="prop">
                <div class="row items-center tree-item" style="width: 100%">
                  <div class="row" style="width: calc(100% - 25px)">
                    <q-icon v-if="prop.node.icon" :name="prop.node.icon" />
                    <div
                      class="q-pl-xs ellipsis"
                      :style="prop.node.icon ? 'width: calc(100% - 25px)' : ''"
                    >
                      {{ prop.node.label }}
                    </div>
                  </div>
                  <div class="absolute-right">
                    <q-btn
                      :id="'more' + prop.node.id"
                      icon="more_horiz"
                      dense
                      unelevated
                      class="more-icon"
                      size="xs"
                      @click="toggleMenu(prop.node.id)"
                      @click.stop
                    >
                      <q-menu
                        class="q-px-xs"
                        anchor="bottom left"
                        self="top middle"
                        @hide="toggleMenu(prop.node.id)"
                      >
                        <q-list dense>
                          <q-item v-close-popup clickable class="q-my-xs">
                            <q-item-section> 添加分支 </q-item-section>
                          </q-item>
                          <!-- <q-separator inset /> -->
                          <q-item v-close-popup clickable class="q-my-xs">
                            <q-item-section> 编辑组织 </q-item-section>
                          </q-item>
                          <q-item v-close-popup clickable class="q-my-xs">
                            <q-item-section> 删除组织 </q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </div>
                </div>
              </template>
            </q-tree>
          </q-tab-panel>
        </div>
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
              <q-tab name="new" label="新用户入职" />
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
                    label="添加成员"
                    class="q-ml-md primary-btn"
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
                      <q-btn
                        size="12px"
                        flat
                        dense
                        icon="more_horiz"
                        class="text-black-white"
                      >
                        <q-menu class="q-px-xs">
                          <q-list dense>
                            <q-item
                              v-if="!props.row.is_deleted"
                              v-close-popup
                              clickable
                              class="q-my-xs"
                            >
                              <q-item-section avatar class="q-pr-none">
                                <q-icon
                                  name="remove_circle_outline"
                                  size="16px"
                                />
                              </q-item-section>
                              <q-item-section> 禁用账号 </q-item-section>
                            </q-item>
                            <q-item
                              v-else
                              v-close-popup
                              clickable
                              class="q-my-xs"
                            >
                              <q-item-section avatar class="q-pr-none">
                                <q-icon name="task_alt" size="16px" />
                              </q-item-section>
                              <q-item-section> 启用账号 </q-item-section>
                            </q-item>
                            <!-- <q-separator inset /> -->
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
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </template>
    </q-splitter>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { QInput, QSelect, QTableProps } from 'quasar';

import DataTable from 'components/table/DataTable.vue';

import { Enterprise, OrgTreeStructure, OrgTypeOption, User } from './type';

const structureData: OrgTreeStructure[] = [
  {
    label: '1. 北京分公司',
    id: 1,
    icon: 'account_balance',
    children: [
      {
        label: '1.1 产品部门',
        id: 2,
        children: [
          {
            label: '1.1.1 产品设计部门',
            id: 3,
          },
          {
            label: '1.1.2 产品研发部门',
            id: 4,
          },
        ],
      },
      {
        label: '1.2 成本部门',
        id: 5,
      },
      {
        label: '1.3 销售部门',
        id: 6,
      },
    ],
  },

  {
    label: '2. 上海分公司',
    id: 101,
    icon: 'account_balance',
    children: [
      {
        label: '2.1 产品部门',
        id: 102,
        children: [
          {
            label: '2.1.1 产品设计部门',
            id: 103,
            children: [
              {
                label: '2.1.1.1 视觉设计部',
                id: 104,
              },
              {
                label: '2.1.1.2 交互设计部',
                id: 107,
              },
            ],
          },
          {
            label: '2.1.2 产品研发部门',
            id: 111,
          },
        ],
      },
      {
        label: '2.2 市场部门',
        id: 112,
      },
      {
        label: '2.3 销售部门',
        id: 113,
      },
    ],
  },
];

const structureData2: OrgTreeStructure[] = [
  {
    label: '北京亚奥之星汽车服务有限公司',
    id: 21,
    icon: 'account_balance',
    children: [
      {
        label: '1.1 售前部门',
        id: 22,
      },
      {
        label: '1.2 售后部门',
        id: 25,
      },
      {
        label: '1.3 维修部门',
        id: 26,
      },
    ],
  },

  {
    label: '利星行平治（北京）汽车有限公司',
    id: 201,
    icon: 'account_balance',
    children: [
      {
        label: '2.1 销售部门',
        id: 202,
      },
      {
        label: '2.2 市场部门',
        id: 212,
      },
      {
        label: '2.3 机修部门',
        id: 213,
      },
    ],
  },
  {
    label: '盛元书院科技有限公司',
    id: 202,
    icon: 'account_balance',
  },
];

const orgData: OrgTypeOption[] = [
  {
    value: 1,
    label: '集团',
    desc: '亦庄盛元集团亦庄盛元集团亦庄盛元集团亦庄盛元集团亦庄盛元集团',
  },
  {
    value: 2,
    label: '经销商',
  },
  {
    value: 3,
    label: '物流商',
    desc: '合作的物流商',
  },
];

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

  components: { DataTable },

  setup() {
    return {
      // splitter
      splitterModel: 350,

      // org selector
      orgTypeOptions: ref<OrgTypeOption[]>(orgData),
      currentOrgType: ref(orgData[0]),
      width: 0,

      // tree
      selected: ref(null),
      filter: ref(''),
      filterRef: ref(null),
      simple: ref<OrgTreeStructure[]>(structureData),

      // table
      tab: ref('enterprises'),
      userColumns: userColumns,
      enterpriseColumns: enterpriseColumns,
      users: userData,
      enterprises: enterpriseData,
      directDeptCheck: ref(true),
    };
  },

  mounted() {
    //this.tab = 'user';
  },

  methods: {
    resetOrgFilter() {
      this.filter = '';
      (this.$refs.filterRef as QInput).focus();
    },

    changeOrgType() {
      if (this.currentOrgType.value === 1) {
        this.simple = structureData;
      } else {
        this.simple = structureData2;
      }
      // setTimeout(() => {
      //   (this.$refs.orgTree as QTree).expandAll();
      // }, 20);
    },

    toggleMenu(nodeId: number) {
      const moreBtn: HTMLElement | null = document.getElementById(
        'more' + nodeId
      );
      if (moreBtn) {
        moreBtn.style.visibility =
          moreBtn.style.visibility === 'visible' ? '' : 'visible';
      }
    },

    showRoleCard() {
      console.error('role');
    },
  },
});
</script>

<style lang="scss">
.splitter-drag-icon {
  height: 30px;
  display: flex;
  align-items: center;
  background-color: $info;
  border-radius: 2px;
}

.tree-item {
  .more-icon {
    visibility: hidden;
    right: 2px;
    top: 2px;
    background-color: rgba(255, 255, 255, 0.07);
  }

  &:hover {
    .more-icon {
      visibility: visible;
    }
  }
}

.q-tree__node--selected {
  background-color: $primary;
}

.frame-table {
  .sticky-table {
    max-height: 100%;
  }
}
</style>
