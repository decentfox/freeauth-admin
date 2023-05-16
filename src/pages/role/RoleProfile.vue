<template>
  <profile-page
    ref="profile"
    v-model:tab-value="panelTab"
    :name="role.name"
    :status="!role.is_deleted"
    :tabs="[
      { name: 'role', label: '基本信息' },
      { name: 'users', label: '管理主体' },
      { name: 'perms', label: '配置权限' },
    ]"
    @update:tab-value="switchPanelTab"
  >
    <template #toolbar-right>
      <dropdown-button
        btn-label="更多操作"
        btn-icon="expand_more"
        btn-class="q-px-md secondary-btn"
        :buttons="[
          {
            label: !role.is_deleted ? '禁用角色' : '启用角色',
            icon: !role.is_deleted ? 'remove_circle_outline' : 'task_alt',
            actionType: !role.is_deleted ? 'disable' : 'enable',
          },

          {
            label: '删除角色',
            icon: 'delete_outline',
            actionType: 'delete',
          },
        ]"
        @disable="toggleRolesStatus([role], true, refreshRoleData)"
        @enable="toggleRolesStatus([role], false, refreshRoleData)"
        @delete="deleteRoles([role], refreshRoleData)"
      />
    </template>
    <template #panels>
      <q-tab-panel name="role">
        <q-card flat bordered class="q-pa-md">
          <q-form>
            <div class="q-col-gutter-md q-pa-sm">
              <div>
                <field-label name="角色归属（不支持变更）" required />
                <div class="row items-center">
                  <q-option-group
                    v-model="roleTypeTab"
                    inline
                    :options="[
                      { label: '全局可选角色', value: 'global' },
                      { label: '指定组织类型下可选角色', value: 'org_type' },
                    ]"
                    disable
                  />
                  <div v-if="!!role.org_type">
                    <q-chip size="12px" square color="secondary">
                      {{ role.org_type.name }}
                    </q-chip>
                  </div>
                </div>
              </div>
              <div>
                <field-label name="角色名称" required />
                <q-input
                  v-model="roleFormData.name"
                  filled
                  dense
                  placeholder="请填写角色名称"
                  hide-bottom-space
                  :error="!!roleFormError.name"
                  :error-message="roleFormError.name"
                />
              </div>
              <div>
                <field-label
                  name="角色 Code"
                  hint="角色的唯一标识符，可用户获取角色信息"
                />
                <q-input
                  v-model="roleFormData.code"
                  filled
                  dense
                  placeholder="请填写角色代码"
                  hide-bottom-space
                  :error="!!roleFormError.code"
                  :error-message="roleFormError.code"
                />
              </div>
              <div>
                <field-label name="角色描述" />
                <q-input
                  v-model="roleFormData.description"
                  filled
                  dense
                  type="textarea"
                  placeholder="请填写角色描述"
                  hide-bottom-space
                />
              </div>
            </div>
            <q-card-actions>
              <q-btn
                unelevated
                class="primary-btn"
                label="保存"
                @click="saveRoleForm"
              />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-tab-panel>
      <q-tab-panel name="users">
        <data-table
          ref="userTable"
          :columns="userColumns"
          sticky-action-column
          search-placeholder="搜索用户信息"
          hide-filter
          hide-import
        >
          <template #table-action>
            <q-btn
              unelevated
              dense
              label="添加主体"
              class="q-ml-sm q-px-md primary-btn"
              @click="bindUsersForm = true"
            />
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
                  !props.row.is_deleted ? 'chip-status-on' : 'chip-status-off'
                "
              />
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props">
              <dropdown-button
                :buttons="[
                  {
                    label: '移除主体',
                    icon: 'person_remove',
                    actionType: 'unbind',
                  },
                ]"
                @click.stop
                @unbind="unbindUsers(role, [props.row], refreshRoleData)"
              />
            </q-td>
          </template>
        </data-table>
      </q-tab-panel>
      <q-tab-panel name="perms"> TODO </q-tab-panel>
    </template>
    <template #dialog>
      <form-dialog
        ref="bindUsersDialog"
        v-model="bindUsersForm"
        title="添加主体"
        width="450px"
        @confirm="saveBindUsersForm"
        @close="resetBindUsersForm"
      >
        <template #form-content>
          <div class="q-gutter-md q-pa-md">
            <div>
              <field-label name="关联主体" required />
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
                  <q-item v-bind="scope.itemProps">
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
            <div v-if="!!role.org_type" class="text-caption hint-label">
              提示：该角色为组织类型【{{
                role.org_type.name
              }}】角色，因此只能搜索到【{{
                role.org_type.name
              }}】下的用户进行关联。如未搜索到目标用户，请先检查其组织归属。
            </div>
          </div>
        </template>
      </form-dialog>
    </template>
  </profile-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { QSelect, QTableProps } from 'quasar';

import { FormDialogComponent } from 'components/dialog/type';
import { RoleOperationsMixin } from 'components/role/RoleOperations';
import { DataTableComponent } from 'components/table/type';
import { ProfileComponent } from 'layouts/type';
import {
  BindUsersPostData,
  Role,
  RolePostData,
  RolePostError,
} from 'pages/role/type';
import { User } from 'pages/user/type';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Department } from '../type';

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
    align: 'left',
    field: 'is_deleted',
    sortable: true,
  },
  {
    name: 'actions',
    label: '操作',
    align: 'left',
    field: 'actions',
  },
];

export default defineComponent({
  name: 'RoleProfile',

  mixins: [RoleOperationsMixin],

  props: {
    roleId: {
      type: String,
      default: null,
    },
    tab: {
      type: String,
      default: 'role',
    },
  },

  setup() {
    return {
      role: ref<Role>({
        id: '',
      }),
      panelTab: ref('role'),
      userColumns: userColumns,

      roleTypeTab: ref('global'),
      roleFormData: ref<RolePostData>({}),
      roleFormError: ref<RolePostError>({}),

      bindUsersForm: ref(false),
      userOptions: ref([]),
      selectedUsers: ref<User[]>(),
      bindUsersFormData: ref<BindUsersPostData>({}),
      bindUsersFormError: ref<BindUsersPostData>({}),
    };
  },

  mounted() {
    this.panelTab = this.tab ? this.tab : this.panelTab;
    this.loadRoleInfo();
  },

  methods: {
    async loadRoleInfo() {
      const resp = await this.$api.get(`/roles/${this.roleId}`);
      this.role = resp.data;
      this.roleFormData = Object.assign({}, resp.data);
      this.roleTypeTab = !!this.role.org_type ? 'org_type' : 'global';
    },

    switchPanelTab(val: string) {
      if (val === 'users') {
        setTimeout(() => {
          const et = this.$refs.userTable as DataTableComponent;
          et.setApiInfo(`/roles/${this.role.id}/users`, 'POST');
          et.fetchRows();
        }, 20);
      }
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
          org_type_id: this.role.org_type?.id,
          include_unassigned_users: !!this.role.org_type ? false : true,
        });
        this.userOptions = resp.data.rows;
      });
    },

    clearFilter() {
      (this.$refs.select as QSelect).updateInputValue('');
    },

    async saveBindUsersForm() {
      this.bindUsersFormData.user_ids = this.selectedUsers
        ? this.selectedUsers.map((user) => user.id)
        : [];
      this.bindUsersFormData.role_ids = [this.role.id];
      try {
        this.bindUsersFormError = {};
        await this.$api.post('/roles/bind_users', this.bindUsersFormData, {
          successMsg: '主体添加成功',
        });
        (this.$refs.bindUsersDialog as FormDialogComponent).hide();
        (this.$refs.userTable as DataTableComponent).fetchRows();
        this.resetBindUsersForm();
      } catch (e) {
        this.bindUsersFormError = (e as Error).cause || {};
      }
    },

    resetBindUsersForm() {
      this.bindUsersFormData = {};
      this.bindUsersFormError = {};
      this.selectedUsers = [];
    },

    async saveRoleForm() {
      if (JSON.stringify(this.role) === JSON.stringify(this.roleFormData))
        return;
      try {
        this.roleFormError = {};
        const resp = await this.$api.put(
          `/roles/${this.role.id}`,
          this.roleFormData,
          {
            successMsg: '角色更新成功',
          }
        );
        this.role = resp.data;
        this.roleFormData = Object.assign({}, resp.data);
        this.roleFormError = {};
      } catch (e) {
        this.roleFormError = (e as Error).cause || {};
      }
    },

    refreshRoleData(op: string) {
      if (['disable', 'enable'].includes(op)) {
        this.loadRoleInfo();
      } else if (op === 'delete') {
        (this.$refs.profile as ProfileComponent).goBack();
      } else if (op === 'unbind') {
        (this.$refs.userTable as DataTableComponent).fetchRows();
      }
    },
  },
});
</script>
