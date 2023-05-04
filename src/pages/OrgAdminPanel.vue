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
        <org-structure-tree
          ref="orgStructure"
          editable
          @update:select-node="onNodeUpdated"
          @update:change-org-type="onOrgTypeChanged"
          @refresh="refresh($event)"
        />
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
                ref="enterpriseTable"
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
                      ($refs.orgStructure as OrgTree).openEnterpriseForm()
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
                    @click="newMemberForm = true"
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
    <form-dialog
      ref="newMemberDialog"
      v-model="newMemberForm"
      title="添加成员"
      width="450px"
    >
      <template #form-content>
        <div class="q-col-gutter-sm q-pa-md">
          <div>
            <field-label name="直属部门" required />
            <tree-select
              :simple="simple"
              multi-select
              :initial-selected-items="editedDepartment"
            />
          </div>
        </div>

        <q-option-group
          v-model="newMemberTab"
          inline
          class="q-px-md"
          :options="[
            { label: '添加已有用户', value: 'member' },
            { label: '创建全新用户', value: 'account' },
          ]"
        />
        <q-separator inset />
        <q-tab-panels v-model="newMemberTab" animated>
          <q-tab-panel name="member">
            <q-select
              ref="select"
              v-model="selectedUsers"
              :options="userOptions"
              placeholder="输入用户姓名进行搜索"
              filled
              dense
              use-input
              hide-dropdown-icon
              multiple
              map-options
              virtual-scroll-slice-size="5"
              :rules="[(val) => (val && val.length > 0) || '至少选择一名成员']"
              @filter="searchUser"
              @update:model-value="clearFilter"
            >
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    找不到任何匹配项
                  </q-item-section>
                </q-item>
              </template>
              <template #selected-item="scope">
                <q-chip
                  removable
                  dense
                  :tabindex="scope.tabindex"
                  color="blue-1"
                  text-color="primary"
                  class="q-ma-none q-mt-xs q-mr-xs"
                  @remove="scope.removeAtIndex(scope.index)"
                >
                  <q-avatar color="primary" text-color="white">
                    {{ scope.opt.name[0] }}
                  </q-avatar>
                  {{ scope.opt.name }}
                </q-chip>
              </template>
              <template #option="scope">
                <q-item
                  v-bind="scope.itemProps"
                  :disable="!scope.opt.is_active"
                >
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white">
                      {{ scope.opt.name[0] }}
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.role }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-tab-panel>
          <q-tab-panel name="account">
            <div class="q-gutter-md">
              <div>
                <field-label name="登录信息" required hint="至少填写一项" />
                <div class="q-gutter-sm">
                  <q-input
                    v-model="newUser.username"
                    filled
                    dense
                    placeholder="请填写用户名"
                    hide-bottom-space
                    class="col"
                    :error="!!createUserFormError.username"
                    :error-message="createUserFormError.username"
                  />
                  <q-input
                    v-model="newUser.mobile"
                    filled
                    dense
                    placeholder="请填写手机号"
                    hide-bottom-space
                    class="col"
                    :error="!!createUserFormError.mobile"
                    :error-message="createUserFormError.mobile"
                  />
                  <q-input
                    v-model="newUser.email"
                    filled
                    dense
                    placeholder="请填写邮箱"
                    hide-bottom-space
                    class="col"
                    :error="!!createUserFormError.email"
                    :error-message="createUserFormError.email"
                    @update:model-value="
                      if (!newUser.email) firstLoginNotification = false;
                    "
                  />
                </div>
                <div
                  v-if="!!createUserFormError.__root__"
                  class="error-hint text-negative"
                >
                  {{ createUserFormError.__root__ }}
                </div>
              </div>
              <div>
                <field-label name="用户姓名" />
                <q-input
                  v-model="newUser.name"
                  filled
                  dense
                  placeholder="请填写用户姓名"
                  hide-bottom-space
                  :error="!!createUserFormError.name"
                  :error-message="createUserFormError.name"
                />
              </div>
              <div>
                <q-toggle
                  v-model="passwordChangingRequired"
                  label="强制用户在首次登录时修改密码"
                />
                <q-toggle
                  v-model="firstLoginNotification"
                  label="通过邮件发送初始默认登录信息"
                  :disable="!newUser.email"
                >
                  <q-tooltip
                    v-if="!newUser.email"
                    anchor="bottom middle"
                    self="center end"
                  >
                    填写有效邮箱后才可启用
                  </q-tooltip>
                </q-toggle>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </form-dialog>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { QSelect, QTableProps, QTreeNode } from 'quasar';
import { DataTableComponent } from 'src/components/table/type';

import FormDialog from 'components/dialog/FormDialog.vue';
import DropdownButton from 'components/DropdownButton.vue';
import FieldLabel from 'components/form/FieldLabel.vue';
import TreeSelect from 'components/form/TreeSelect.vue';
import OrgStructureTree from 'components/OrgTree.vue';
import DataTable from 'components/table/DataTable.vue';

import { Enterprise, OrgTree, UserPostData, UserPostError } from './type';

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
    name: 'code',
    label: '企业 Code',
    field: 'code',
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

  components: {
    DataTable,
    DropdownButton,
    FieldLabel,
    FormDialog,
    OrgStructureTree,
    TreeSelect,
  },

  setup() {
    return {
      // splitter
      splitterModel: 350,

      // tree
      simple: ref<QTreeNode[]>(),
      selectedOrgTypeId: ref(''),

      // table
      tab: ref('enterprises'),
      // enterprise
      enterpriseColumns: enterpriseColumns,
      // users
      userColumns: userColumns,
      directDeptCheck: ref(false),

      // form dialog
      newMemberForm: ref(false),
      newMemberTab: ref('member'),
      editedDepartment: ref<QTreeNode[]>(),
      // add new member
      newUser: ref<UserPostData>({}),
      userKeyword: ref(''),
      selectedUsers: ref([]),
      userOptions: ref([]),
      // add new account
      createUserForm: ref(false),
      createUserFormError: ref<UserPostError>({}),
      firstLoginNotification: ref(false),
      passwordChangingRequired: ref(false),
    };
  },

  methods: {
    operateOneEnterprise(evt: Event, enterprise: Enterprise) {
      if (evt.type === 'edit') {
        (this.$refs.orgStructure as OrgTree).openEnterpriseForm(enterprise.id);
      } else if (evt.type === 'delete') {
        (this.$refs.orgStructure as OrgTree).deleteOrganization(enterprise.id);
      }
    },

    onNodeUpdated(node: QTreeNode) {
      this.editedDepartment = node ? [node] : [];
    },

    onOrgTypeChanged(selectedId: string) {
      this.selectedOrgTypeId = selectedId;
      this.loadEnterpriseTable();
    },

    refresh(evt: Event) {
      if (evt.toString() === 'enterprise') {
        this.loadEnterpriseTable();
      }
    },

    async loadEnterpriseTable() {
      const et = this.$refs.enterpriseTable as DataTableComponent;
      et.fetchRows(
        `/org_types/${this.selectedOrgTypeId}/enterprises/query`,
        'POST'
      );
    },

    searchUser(
      val: string,
      update: (fn: () => void) => void,
      abort: () => void
    ) {
      const kw = val.trim();
      if (kw === '') {
        abort();
        return;
      }
      update(async () => {
        // TODO
        let resp = await this.$api.get('/users/options', {
          params: {
            keyword: kw,
            is_active: true,
          },
        });
        this.userOptions = resp.data.rows;
      });
    },

    clearFilter() {
      (this.$refs.select as QSelect).updateInputValue('');
    },
  },
});
</script>

<style lang="scss" scoped></style>
