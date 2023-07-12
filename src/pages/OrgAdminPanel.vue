<template>
  <page-wrapper page-title="组织管理">
    <q-splitter v-model="splitterModel" unit="px" :limits="[250, 400]">
      <!--the first splitted screen-->
      <template #before>
        <org-tree
          ref="orgStructure"
          editable
          @update:select-node="onNodeUpdated"
          @update:org-type="onOrgTypeChanged"
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
        <div class="q-pl-md">
          <q-toolbar class="q-pa-none">
            <q-tabs
              v-model="leftPanelTab"
              dense
              class="text-grey-7"
              active-color="primary"
              indicator-color="primary"
              align="left"
              narrow-indicator
              @update:model-value="switchPanelTab"
            >
              <q-tab name="users" label="成员列表" />
              <q-tab name="enterprises" label="企业信息" />
            </q-tabs>
          </q-toolbar>
          <q-tab-panels v-model="leftPanelTab" animated>
            <q-tab-panel
              name="users"
              class="scroll q-pa-none frame-table"
              style="height: calc(100vh - 180px)"
            >
              <data-table
                ref="userTable"
                :columns="userColumns"
                sticky-action-column
                search-placeholder="搜索用户信息"
                hide-filter
              >
                <template #extra-filters>
                  <q-checkbox
                    v-model="directDeptCheck"
                    label="仅展示部门的直属成员"
                    @update:model-value="filterDirectUsers"
                  />
                </template>
                <template #table-action>
                  <div>
                    <q-btn
                      unelevated
                      dense
                      label="添加成员"
                      class="q-ml-sm q-px-md primary-btn"
                      :disable="!selectedNode.id"
                      @click="openAddMembersForm"
                    />
                    <q-tooltip
                      v-if="!selectedNode.id"
                      anchor="bottom left"
                      self="top start"
                    >
                      选择左侧组织后可添加成员
                    </q-tooltip>
                  </div>
                </template>
                <template #body-cell-departments="props">
                  <q-td :props="props">
                    <chip-group :chips="props.row.departments" square />
                  </q-td>
                </template>
                <template #body-cell-is_deleted="props">
                  <q-td :props="props">
                    <boolean-chip
                      :value="!props.row.is_deleted"
                      true-label="正常"
                      false-label="禁用"
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
                          label: '变更组织',
                          icon: 'sync_alt',
                          actionType: 'transfer',
                        },
                        {
                          label: '办理离职',
                          icon: 'logout',
                          actionType: 'resign',
                        },
                      ]"
                      @click.stop
                      @disable="
                        toggleUsersStatus([props.row], true, loadUserTable)
                      "
                      @enable="
                        toggleUsersStatus([props.row], false, loadUserTable)
                      "
                      @resign="resignUsers([props.row], loadUserTable)"
                      @transfer="openTransferForm(props.row)"
                    />
                  </q-td>
                </template>
              </data-table>
            </q-tab-panel>
            <q-tab-panel
              name="enterprises"
              class="scroll q-pa-none frame-table"
              style="height: calc(100vh - 150px)"
            >
              <data-table
                ref="enterpriseTable"
                :columns="enterpriseColumns"
                sticky-action-column
                search-placeholder="搜索企业信息"
                hide-filter
                @row-click="copyInfoToClipboard"
              >
                <template #table-action>
                  <q-btn
                    unelevated
                    dense
                    label="创建企业"
                    class="q-ml-sm q-px-md primary-btn"
                    @click="
                      (
                        $refs.orgStructure as OrgTreeComponent
                      ).openEnterpriseForm()
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
                          label: '复制信息',
                          icon: 'copy_all',
                          actionType: 'copy',
                        },
                        {
                          label: '删除企业',
                          icon: 'delete_outline',
                          actionType: 'delete',
                        },
                      ]"
                      @click.stop
                      @edit="
                        (
                          $refs.orgStructure as OrgTreeComponent
                        ).openEnterpriseForm(props.row.id)
                      "
                      @copy="copyInfoToClipboard(props.row)"
                      @delete="
                        selectedNode.id === props.row.id
                          ? deleteOrganization(
                              props.row,
                              refreshAfterDeletingSelectedOrg,
                              true
                            )
                          : deleteOrganization(
                              props.row,
                              refreshAfterDeletingOrg,
                              true
                            )
                      "
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
      ref="addMembersDialog"
      v-model="addMembersForm"
      title="添加成员"
      width="450px"
      @confirm="saveAddMembersForm"
      @close="resetAddMembersForm"
    >
      <template #form-content>
        <div class="q-col-gutter-sm q-pa-md">
          <div>
            <field-label text="直属组织" required />
            <tree-select
              v-model="selectedOrganizations"
              :nodes="orgTreeData"
              multi-select
              :initial-selected-items="parentDepartment"
            />
            <div
              v-if="!!bindUsersFormError.organization_ids"
              class="error-hint text-negative"
            >
              {{ bindUsersFormError.organization_ids }}
            </div>
          </div>
        </div>
        <q-option-group
          v-model="addMembersTab"
          inline
          class="q-px-md"
          :options="[
            { label: '添加已有用户', value: 'existing' },
            { label: '创建全新用户', value: 'new' },
          ]"
        />
        <q-separator inset />
        <q-tab-panels v-model="addMembersTab" animated>
          <q-tab-panel name="existing">
            <div class="q-gutter-md">
              <div>
                <field-label text="关联用户" required />
                <searchable-multiple-select
                  v-model="selectedExistingUsers"
                  placeholder="输入用户信息进行搜索"
                  option-api-url="/users/query"
                  :option-api-params="{
                    org_type_id: selectedOrgType.id,
                    include_unassigned_users: true,
                  }"
                />
                <div
                  v-if="!!bindUsersFormError.user_ids"
                  class="error-hint text-negative"
                >
                  {{ bindUsersFormError.user_ids }}
                </div>
              </div>
              <div class="text-caption hint-label">
                提示：仅能选择尚无组织归属或属于当前页所选【{{
                  selectedOrgType.name
                }}】下的用户。
              </div>
            </div>
          </q-tab-panel>
          <q-tab-panel name="new">
            <user-form-content
              v-model="newUserFormData"
              :form-error="newUserFormError"
            />
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </form-dialog>
    <set-orgs-form ref="setOrganizationsForm" @user-updated="loadUserTable" />
  </page-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { QTableProps, QTreeNode } from 'quasar';

import { FormDialogComponent } from 'components/dialog/type';
import { OrgOperationsMixin } from 'components/organization/OrgOperations';
import {
  BindUsersToOrgsPostData,
  BindUsersToOrgsPostError,
  Enterprise,
  OrgTreeComponent,
  OrgType,
} from 'components/organization/type';
import { DataTableComponent } from 'components/table/type';
import {
  SetOrganizationsComponent,
  User,
  UserPostData,
  UserPostError,
} from 'components/user/type';
import { UserOperationsMixin } from 'components/user/UserOperations';

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
    name: 'departments',
    label: '直属组织',
    align: 'left',
    field: 'departments',
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

  mixins: [UserOperationsMixin, OrgOperationsMixin],

  setup() {
    return {
      // splitter
      splitterModel: 300,

      // tree
      selectedOrgType: ref({
        id: '',
        name: '',
      }),
      selectedNode: ref({
        id: '',
        name: '',
      }),

      // table
      leftPanelTab: ref('users'),
      // enterprise
      enterpriseColumns: enterpriseColumns,
      // users
      userColumns: userColumns,
      directDeptCheck: ref(false),

      // form dialog
      orgTreeData: ref<QTreeNode[]>([]),
      addMembersForm: ref(false),
      addMembersTab: ref('existing'),
      parentDepartment: ref<QTreeNode[]>([]),
      selectedOrganizations: ref<string[]>([]),

      // add new member, existing user
      selectedExistingUsers: ref<User[]>([]),
      bindUsersFormData: ref<BindUsersToOrgsPostData>({}),
      bindUsersFormError: ref<BindUsersToOrgsPostError>({}),

      // add new user
      newUserFormData: ref<UserPostData>({
        reset_pwd_on_first_login: false,
        send_first_login_email: false,
      }),
      newUserFormError: ref<UserPostError>({}),
    };
  },

  methods: {
    onNodeUpdated(node: QTreeNode) {
      this.selectedNode.id = node.id;
      this.selectedNode.name = node.name;
      this.loadUserTable();
    },

    onOrgTypeChanged(selected: OrgType) {
      this.selectedOrgType = selected;
      this.selectedNode = {
        id: '',
        name: '',
      };
      this.loadEnterpriseTable();
      this.loadUserTable();
    },

    refresh(evt: Event) {
      if (evt.toString() === 'enterprise') {
        this.loadEnterpriseTable();
      }
    },

    async loadEnterpriseTable() {
      if (this.leftPanelTab === 'enterprises') {
        setTimeout(() => {
          const et = this.$refs.enterpriseTable as DataTableComponent;
          et.setApiInfo('/enterprises/query', 'POST');
          et.onExternalFiltered('org_type_id', this.selectedOrgType.id);
        }, 20);
      }
    },

    async loadUserTable() {
      if (this.leftPanelTab === 'users' && this.selectedNode.id) {
        setTimeout(() => {
          const ut = this.$refs.userTable as DataTableComponent;
          ut.setApiInfo(
            `/organizations/${this.selectedNode.id}/members`,
            'POST'
          );
          ut.fetchRows();
        }, 20);
      }
    },

    refreshAfterDeletingOrg() {
      (this.$refs.orgStructure as OrgTreeComponent).loadOrgTree();
      this.loadEnterpriseTable();
    },

    refreshAfterDeletingSelectedOrg() {
      (this.$refs.orgStructure as OrgTreeComponent).loadOrgTree(true);
      this.loadEnterpriseTable();
    },

    switchPanelTab(val: string) {
      if (val === 'users') {
        this.loadUserTable();
      } else if (val === 'enterprises') {
        this.loadEnterpriseTable();
      }
    },

    filterDirectUsers(val: boolean) {
      const ut = this.$refs.userTable as DataTableComponent;
      ut.onExternalFiltered('include_sub_members', !val);
    },

    async openAddMembersForm() {
      this.addMembersForm = true;
      const resp = await this.$api.get(
        `/org_types/${this.selectedOrgType.id}/organization_tree`
      );
      this.orgTreeData = resp.data;
      if (!!this.selectedNode.id) {
        this.parentDepartment = [this.selectedNode];
        this.selectedOrganizations = [this.selectedNode.id];
      }
    },

    async saveAddMembersForm() {
      const postParams = { org_type_id: this.selectedOrgType.id };
      if (this.addMembersTab === 'existing' && this.selectedExistingUsers) {
        this.bindUsersFormData.user_ids = this.selectedExistingUsers.map(
          (user) => user.id
        );
        this.bindUsersFormData.organization_ids = this.selectedOrganizations;
        try {
          this.bindUsersFormError = {};
          await this.$api.post(
            '/organizations/bind_users',
            Object.assign(postParams, this.bindUsersFormData),
            {
              successMsg: '成员添加成功',
            }
          );
          this.afterSaveAddMembers();
        } catch (e) {
          this.bindUsersFormError = (e as Error).cause || {};
        }
      } else if (this.addMembersTab == 'new') {
        this.newUserFormData.organization_ids = this.selectedOrganizations;
        try {
          this.newUserFormError = {};
          await this.$api.post(
            '/users',
            Object.assign(postParams, this.newUserFormData),
            {
              successMsg: '成员创建成功',
            }
          );
          this.afterSaveAddMembers();
        } catch (e) {
          this.newUserFormError = (e as Error).cause || {};
        }
      }
    },

    afterSaveAddMembers() {
      (this.$refs.addMembersDialog as FormDialogComponent).hide();
      this.loadUserTable();
      this.resetAddMembersForm();
    },

    resetAddMembersForm() {
      this.bindUsersFormData = {};
      this.bindUsersFormError = {};
      this.newUserFormData = {
        reset_pwd_on_first_login: false,
        send_first_login_email: false,
      };
      this.newUserFormError = {};
      this.selectedExistingUsers = [];
      this.selectedOrganizations = [];
      this.addMembersTab = 'existing';
    },

    openTransferForm(user: User) {
      (this.$refs.setOrganizationsForm as SetOrganizationsComponent).show(user);
    },

    copyInfoToClipboard(row: Enterprise) {
      const info = [
        '企业全称：' + row.name,
        '企业 Code：' + (row.code ? row.code : ''),
        '纳税识别号：' + (row.tax_id ? row.tax_id : ''),
        '开户行：' + (row.issuing_bank ? row.issuing_bank : ''),
        '银行账号：' + (row.bank_account_number ? row.bank_account_number : ''),
        '办公地址：' + (row.contact_address ? row.contact_address : ''),
        '办公电话：' + (row.contact_phone_num ? row.contact_phone_num : ''),
      ];
      let text = info.join('\n');
      this.$utils.copyToClipboard(text);
    },
  },
});
</script>

<style lang="scss" scoped></style>
