<template>
  <q-page class="full-width">
    <q-splitter
      v-model="splitterModel"
      class="q-py-sm"
      unit="px"
      :limits="[250, 400]"
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
              style="height: calc(100vh - 150px)"
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
                    <q-chip
                      v-for="(dept, idx) in (props.row.departments as Department[])"
                      :key="idx"
                      size="12px"
                      square
                      color="secondary"
                      class="q-ml-none"
                    >
                      {{ dept.name }}
                    </q-chip>
                  </q-td>
                </template>
                <template #body-cell-is_deleted="props">
                  <q-td :props="props">
                    <q-chip
                      square
                      size="12px"
                      :label="!props.row.is_deleted ? '正常' : '禁用'"
                      class="text-weight-bold q-pa-sm q-ml-none"
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
                    <user-operations ref="userOps" @refresh="refreshUserData">
                      <template #actions>
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
                            ($refs.userOps as UserMethods).toggleUsersStatus(
                              [props.row],
                              true
                            )
                          "
                          @enable="
                            ($refs.userOps as UserMethods).toggleUsersStatus(
                              [props.row],
                              false
                            )
                          "
                          @resign="resignUsers([props.row])"
                          @transfer="openTransferForm(props.row)"
                        />
                      </template>
                    </user-operations>
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
                        ($refs.orgStructure as OrgTree).openEnterpriseForm(
                          props.row.id
                        )
                      "
                      @copy="copyInfoToClipboard(props.row)"
                      @delete="
                        ($refs.orgStructure as OrgTree).deleteOrganization(
                          props.row.id
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
            <field-label name="直属组织" required />
            <tree-select
              v-model="bindUsersFormData.organization_ids"
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
                <field-label name="关联用户" required />
                <q-select
                  ref="select"
                  v-model="selectedExistingUsers"
                  :options="userOptions"
                  placeholder="输入用户姓名进行搜索"
                  filled
                  dense
                  use-input
                  hide-dropdown-icon
                  multiple
                  map-options
                  virtual-scroll-slice-size="5"
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
                      color="primary"
                      text-color="white"
                      class="q-pa-sm"
                      :label="scope.opt.name"
                      @remove="scope.removeAtIndex(scope.index)"
                    />
                  </template>
                  <template #option="scope">
                    <q-item
                      v-bind="scope.itemProps"
                      :disable="
                        !!scope.opt.org_type &&
                        scope.opt.org_type.id !== selectedOrgType.id
                      "
                    >
                      <q-item-section avatar>
                        <q-chip
                          square
                          size="12px"
                          :label="!scope.opt.is_deleted ? '正常' : '禁用'"
                          class="text-weight-bold q-pa-sm"
                          :class="
                            !scope.opt.is_deleted
                              ? 'chip-status-on'
                              : 'chip-status-off'
                          "
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>
                          {{ scope.opt.name }}（{{ scope.opt.username }}）
                        </q-item-label>
                        <q-item-label caption>
                          {{ scope.opt.mobile }} {{ scope.opt.email }}
                        </q-item-label>
                      </q-item-section>
                      <q-item-section v-if="!!scope.opt.org_type" side>
                        <q-chip
                          square
                          size="12px"
                          :label="scope.opt.org_type.name"
                          class="q-pa-sm bg-secondary"
                        />
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
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
            <div class="q-gutter-md">
              <div>
                <field-label name="登录信息" required hint="至少填写一项" />
                <div class="q-gutter-sm">
                  <q-input
                    v-model="newUserFormData.username"
                    filled
                    dense
                    placeholder="请填写用户名"
                    hide-bottom-space
                    class="col"
                    :error="!!newUserFormError.username"
                    :error-message="newUserFormError.username"
                  />
                  <q-input
                    v-model="newUserFormData.mobile"
                    filled
                    dense
                    placeholder="请填写手机号"
                    hide-bottom-space
                    class="col"
                    :error="!!newUserFormError.mobile"
                    :error-message="newUserFormError.mobile"
                  />
                  <q-input
                    v-model="newUserFormData.email"
                    filled
                    dense
                    placeholder="请填写邮箱"
                    hide-bottom-space
                    class="col"
                    :error="!!newUserFormError.email"
                    :error-message="newUserFormError.email"
                    @update:model-value="
                      if (!newUserFormData.email)
                        firstLoginNotification = false;
                    "
                  />
                </div>
                <div
                  v-if="!!newUserFormError.__root__"
                  class="error-hint text-negative"
                >
                  {{ newUserFormError.__root__ }}
                </div>
              </div>
              <div>
                <field-label name="用户姓名" />
                <q-input
                  v-model="newUserFormData.name"
                  filled
                  dense
                  placeholder="请填写用户姓名"
                  hide-bottom-space
                  :error="!!newUserFormError.name"
                  :error-message="newUserFormError.name"
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
                  :disable="!newUserFormData.email"
                >
                  <q-tooltip
                    v-if="!newUserFormData.email"
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

    <form-dialog
      ref="transferDialog"
      v-model="transferForm"
      title="变更组织归属"
      width="450px"
      @confirm="saveTransferForm"
      @close="resetTransferForm"
    >
      <template #form-content>
        <div class="q-gutter-md q-pa-md">
          <div>
            <field-label name="组织归属变更为" required />
            <tree-select
              v-model="transferFormData.organization_ids"
              :nodes="orgTreeData"
              multi-select
              :initial-selected-items="parentDepartment"
            />
            <div
              v-if="!!transferFormError.organization_ids"
              class="error-hint text-negative"
            >
              {{ transferFormError.organization_ids }}
            </div>
          </div>
          <div class="text-caption hint-label">
            提示：如需彻底移除所属组织，请点击【办理离职】。
          </div>
        </div>
      </template>
    </form-dialog>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { QSelect, QTableProps, QTreeNode } from 'quasar';
import { FormDialogComponent } from 'src/components/dialog/type';
import { DataTableComponent } from 'src/components/table/type';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { UserMethods } from 'src/components/user/type';
import UserOperations from 'src/components/user/UserOperations.vue';

import ConfirmDialog from 'components/dialog/ConfirmDialog.vue';
import FormDialog from 'components/dialog/FormDialog.vue';
import DropdownButton from 'components/DropdownButton.vue';
import FieldLabel from 'components/form/FieldLabel.vue';
import TreeSelect from 'components/form/TreeSelect.vue';
import OrgStructureTree from 'components/OrgTree.vue';
import DataTable from 'components/table/DataTable.vue';

import {
  BindUsersPostData,
  BindUsersPostError,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Department,
  Enterprise,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  OrgTree,
  OrgType,
  TransferPostData,
  TransferPostError,
  User,
  UserPostData,
  UserPostError,
} from './type';

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

  components: {
    DataTable,
    DropdownButton,
    FieldLabel,
    FormDialog,
    OrgStructureTree,
    TreeSelect,
    UserOperations,
  },

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
      orgTreeData: ref<QTreeNode[]>(),
      addMembersForm: ref(false),
      addMembersTab: ref('existing'),
      parentDepartment: ref<QTreeNode[]>(),

      // add new member, existing user
      userOptions: ref([]),
      selectedExistingUsers: ref<User[]>(),
      bindUsersFormData: ref<BindUsersPostData>({}),
      bindUsersFormError: ref<BindUsersPostError>({}),

      // add new user
      newUserFormData: ref<UserPostData>({}),
      newUserFormError: ref<UserPostError>({}),
      firstLoginNotification: ref(false),
      passwordChangingRequired: ref(false),

      // transfer user
      transferForm: ref(false),
      transferFormData: ref<TransferPostData>({}),
      transferFormError: ref<TransferPostError>({}),
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
        let resp = await this.$api.post('/users/query', {
          q: kw,
          include_unassigned_users: true,
        });
        this.userOptions = resp.data.rows;
      });
    },

    clearFilter() {
      (this.$refs.select as QSelect).updateInputValue('');
    },

    async openAddMembersForm() {
      const resp = await this.$api.get(
        `/org_types/${this.selectedOrgType.id}/organization_tree`
      );
      this.orgTreeData = resp.data;
      this.parentDepartment = [this.selectedNode];
      this.newUserFormData.organization_ids = [this.selectedNode.id];
      this.bindUsersFormData.organization_ids = [this.selectedNode.id];
      this.addMembersForm = true;
    },

    async saveAddMembersForm() {
      if (this.addMembersTab === 'existing' && this.selectedExistingUsers) {
        this.bindUsersFormData.user_ids = this.selectedExistingUsers.map(
          (user) => user.id
        );
        try {
          this.bindUsersFormError = {};
          await this.$api.post(
            '/organizations/members',
            Object.assign(
              {
                org_type_id: this.selectedOrgType.id,
              },
              this.bindUsersFormData
            ),
            {
              successMsg: '成员添加成功',
            }
          );
          (this.$refs.addMembersDialog as FormDialogComponent).hide();
          this.loadUserTable();
          this.resetAddMembersForm();
        } catch (e) {
          this.bindUsersFormError = (e as Error).cause || {};
        }
      } else if (this.addMembersTab == 'new') {
        try {
          this.newUserFormError = {};
          await this.$api.post(
            '/users',
            Object.assign(
              {
                org_type_id: this.selectedOrgType.id,
              },
              this.newUserFormData
            ),
            {
              successMsg: '成员创建成功',
            }
          );
          (this.$refs.addMembersDialog as FormDialogComponent).hide();
          this.loadUserTable();
          this.resetAddMembersForm();
        } catch (e) {
          this.newUserFormError = (e as Error).cause || {};
        }
      }
    },

    resetAddMembersForm() {
      this.bindUsersFormData = {};
      this.bindUsersFormError = {};
      this.newUserFormData = {};
      this.newUserFormError = {};
      this.selectedExistingUsers = [];
      this.addMembersTab = 'existing';
    },

    refreshUserData(evt: Event) {
      if (evt.type === 'disable' || evt.type === 'enable') {
        this.loadUserTable();
      }
    },

    resignUsers(users: User[]) {
      const userDesc = `${users[0].name || users[0].username}${
        users[0].mobile ? `（${users[0].mobile}）` : ''
      }${users.length > 1 ? `等 ${users.length} 人` : ''}`;

      this.$q
        .dialog({
          component: ConfirmDialog,
          componentProps: {
            title: '办理离职',
            content: `您正在请求为成员：${userDesc}办理离职。操作后，该成员授权、组织部门和角色等关系将被删除，转为普通用户。如需同时禁用该用户，请点击【离职并禁用】。
`,
            buttons: [
              { label: '取消', class: 'secondary-btn' },
              {
                label: '离职',
                actionType: 'resign',
                class: 'accent-btn',
              },
              {
                label: '离职并禁用',
                actionType: 'resign_disable',
                class: 'accent-btn',
              },
            ],
          },
        })
        .onOk(async ({ type }) => {
          if (['resign', 'resign_disable'].indexOf(type) >= 0) {
            let postData = {};
            if (type === 'resign') {
              postData = { user_ids: users.map((u: User) => u.id) };
            } else if (type === 'resign_disable') {
              postData = {
                user_ids: users.map((u: User) => u.id),
                is_deleted: true,
              };
            }
            try {
              await this.$api.request({
                method: 'POST',
                url: '/users/resign',
                data: postData,
                successMsg: '离职办理成功',
              });
            } finally {
              this.loadUserTable();
            }
          }
        });
    },

    async openTransferForm(user: User) {
      const resp = await this.$api.get(
        `/org_types/${this.selectedOrgType.id}/organization_tree`
      );
      this.orgTreeData = resp.data;
      this.transferFormData.user_id = user.id;
      this.parentDepartment = user.departments;
      if (user.departments) {
        this.transferFormData.organization_ids = user.departments.map(
          (d) => d.id
        );
      }
      this.transferForm = true;
    },

    async saveTransferForm() {
      try {
        this.transferFormError = {};
        await this.$api.put(
          `/users/${this.transferFormData.user_id}/organizations`,
          this.transferFormData,
          {
            successMsg: '组织归属变更成功',
          }
        );
        (this.$refs.transferDialog as FormDialogComponent).hide();
        this.loadUserTable();
        this.resetTransferForm();
      } catch (e) {
        this.transferFormError = (e as Error).cause || {};
      }
    },

    resetTransferForm() {
      this.transferFormData = {};
      this.transferFormError = {};
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
