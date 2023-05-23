<template>
  <profile-page
    ref="profile"
    v-model:tab-value="panelTab"
    :name="`${user.name}（${user.username}）`"
    :status="!user.is_deleted"
    :tabs="[
      { name: 'user', label: '基本信息' },
      { name: 'organizations', label: '组织归属' },
      { name: 'roles', label: '角色信息' },
      { name: 'perms', label: '权限信息' },
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
            label: !user.is_deleted ? '禁用账号' : '启用账号',
            icon: !user.is_deleted ? 'remove_circle_outline' : 'task_alt',
            actionType: !user.is_deleted ? 'disable' : 'enable',
          },
          {
            label: '重置密码',
            icon: 'restart_alt',
            actionType: 'reset_password',
          },
          {
            label: '删除账号',
            icon: 'delete_outline',
            actionType: 'delete',
          },
        ]"
        @disable="toggleUsersStatus([user], true, refreshUserData)"
        @enable="toggleUsersStatus([user], false, refreshUserData)"
        @delete="deleteUsers([user], refreshUserData)"
      />
    </template>
    <template #panels>
      <q-tab-panel name="user">
        <q-card flat bordered class="q-pa-md">
          <q-form>
            <div class="q-col-gutter-md q-pa-sm">
              <div>
                <field-label name="姓名（昵称）" required />
                <q-input
                  v-model="userFormData.name"
                  filled
                  dense
                  placeholder="请填写用户姓名"
                  hide-bottom-space
                  :error="!!userFormError.name"
                  :error-message="userFormError.name"
                />
              </div>
              <div>
                <field-label
                  name="用户名"
                  required
                  hint="可用于用户名密码登录"
                />
                <q-input
                  v-model="userFormData.username"
                  filled
                  dense
                  placeholder="请填写用户姓名"
                  hide-bottom-space
                  :error="!!userFormError.username"
                  :error-message="userFormError.username"
                />
              </div>
              <div>
                <field-label name="手机号码" hint="可用于手机号验证码登录" />
                <q-input
                  v-model="userFormData.mobile"
                  filled
                  dense
                  placeholder="请填写手机号"
                  hide-bottom-space
                  class="col"
                  :error="!!userFormError.mobile"
                  :error-message="userFormError.mobile"
                />
              </div>
              <div>
                <field-label name="邮箱地址" hint="可用于邮箱验证码登录" />
                <q-input
                  v-model="userFormData.email"
                  filled
                  dense
                  placeholder="请填写邮箱"
                  hide-bottom-space
                  class="col"
                  :error="!!userFormError.email"
                  :error-message="userFormError.email"
                />
              </div>
            </div>
            <q-card-actions>
              <q-btn
                unelevated
                class="primary-btn"
                label="保存"
                @click="saveUserForm"
              />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-tab-panel>
      <q-tab-panel name="organizations">
        <q-table
          flat
          wrap-cells
          hide-pagination
          :rows="user.departments"
          :columns="deptColumns"
        >
          <template #body-cell-org_type="props">
            <q-td :props="props">
              <q-chip
                v-if="props.row.org_type"
                size="12px"
                square
                color="secondary"
                class="q-ml-none"
              >
                {{ props.row.org_type.name }}
              </q-chip>
            </q-td>
          </template>
          <template #body-cell-enterprise="props">
            <q-td :props="props">
              <q-chip size="12px" square color="secondary" class="q-ml-none">
                {{
                  props.row.enterprise
                    ? props.row.enterprise.name
                    : props.row.name
                }}
              </q-chip>
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props">
              <dropdown-button
                :buttons="[
                  {
                    label: '移出组织',
                    icon: 'person_remove',
                    actionType: 'unbind',
                  },
                ]"
                @click.stop
                @unbind="unbindOrgs(user, [props.row], refreshUserData)"
              />
            </q-td>
          </template>
          <template #no-data="{ icon, message }">
            <div class="full-width row flex-center q-gutter-sm text-grey-6">
              <q-icon :name="icon" />
              <span>
                {{ message }}
              </span>
            </div>
          </template>
        </q-table>
        <q-toolbar class="q-my-md q-gutter-sm">
          <q-btn
            unelevated
            dense
            :label="user.departments?.length !== 0 ? '变更组织' : '加入组织'"
            class="q-px-sm primary-btn"
            @click="openSetOrganizationsForm"
          />
          <q-btn
            v-if="user.departments?.length !== 0"
            unelevated
            dense
            label="办理离职"
            class="q-px-sm primary-btn"
            @click="resignUsers([user], refreshUserData)"
          />
        </q-toolbar>
      </q-tab-panel>
      <q-tab-panel name="roles">
        <q-table
          flat
          wrap-cells
          hide-pagination
          :rows="user.roles"
          :columns="roleColumns"
        >
          <template #body-cell-org_type="props">
            <q-td :props="props">
              <q-chip size="12px" square color="secondary" class="q-ml-none">
                {{ props.row.org_type ? props.row.org_type.name : '全局' }}
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
                    label: '移除角色',
                    icon: 'person_remove',
                    actionType: 'unbind',
                  },
                ]"
                @click.stop
                @unbind="unbindRoles(user, [props.row], refreshUserData)"
              />
            </q-td>
          </template>
          <template #no-data="{ icon, message }">
            <div class="full-width row flex-center q-gutter-sm text-grey-6">
              <q-icon :name="icon" />
              <span>
                {{ message }}
              </span>
            </div>
          </template>
        </q-table>
        <q-toolbar class="q-my-md q-gutter-sm">
          <q-btn
            unelevated
            dense
            label="配置角色"
            class="q-px-sm primary-btn"
            @click="openSetRolesForm"
          />
        </q-toolbar>
      </q-tab-panel>
      <q-tab-panel name="perms">
        <data-table
          ref="permTable"
          :columns="permColumns"
          sticky-action-column
          search-placeholder="搜索权限信息"
          hide-filter
          hide-import
          hide-export
        >
          <template #body-cell-tags="props">
            <q-td :props="props">
              <q-chip
                v-for="(tag, idx) in props.row.tags"
                :key="idx"
                size="12px"
                color="secondary"
                class="q-ml-none"
              >
                <span class="material-icons-outlined q-pr-xs">
                  local_offer
                </span>
                {{ tag.name }}
              </q-chip>
            </q-td>
          </template>
          <template #body-cell-roles="props">
            <q-td :props="props">
              <div class="row">
                <div
                  v-for="(role, idx) in (props.row.roles as Role[])"
                  :key="idx"
                >
                  <q-chip
                    v-if="
                      user.roles &&
                      user.roles.map((r) => r.id).includes(role.id)
                    "
                    size="12px"
                    square
                    color="secondary"
                    class="q-ml-none"
                  >
                    {{ role.name }}
                  </q-chip>
                </div>
              </div>
            </q-td>
          </template>
          <template #body-cell-application="props">
            <q-td :props="props">
              <q-chip size="12px" square color="secondary" class="q-ml-none">
                {{ props.row.application.name }}
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
          <template #no-data="{ icon, message }">
            <div class="full-width row flex-center q-gutter-sm text-grey-6">
              <q-icon :name="icon" />
              <span>
                {{ message }}
              </span>
            </div>
          </template>
        </data-table>
      </q-tab-panel>
    </template>
    <template #dialog>
      <set-organizations-form
        ref="setOrganizationsForm"
        @user-updated="loadUserInfo"
      />
      <set-roles-form ref="setRolesForm" @user-updated="loadUserInfo" />
    </template>
  </profile-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { QTableProps } from 'quasar';

import { DataTableComponent } from 'components/table/type';
import {
  SetOrganizationsComponent,
  SetRolesComponent,
} from 'components/user/type';
import { UserOperationsMixin } from 'components/user/UserOperations';
import { ProfileComponent } from 'layouts/type';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Role } from '../role/type';

import { User, UserPostData, UserPostError } from './type';

const roleColumns: QTableProps['columns'] = [
  {
    name: 'name',
    label: '角色名称',
    align: 'left',
    field: 'name',
  },
  {
    name: 'code',
    label: '角色代码',
    align: 'left',
    field: 'code',
  },
  {
    name: 'description',
    label: '角色描述',
    align: 'left',
    field: 'description',
    style: 'max-width: 400px',
    headerStyle: 'max-width: 400px',
  },
  {
    name: 'org_type',
    label: '组织类型归属',
    align: 'left',
    field: 'org_type',
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

const deptColumns: QTableProps['columns'] = [
  {
    name: 'org_type',
    label: '组织类型归属',
    align: 'left',
    field: 'org_type',
  },
  {
    name: 'enterprise',
    label: '企业归属',
    align: 'left',
    field: 'enterprise',
  },
  {
    name: 'name',
    label: '直属组织名称',
    align: 'left',
    field: 'name',
  },
  {
    name: 'code',
    label: '直属组织代码',
    align: 'left',
    field: (row) => (row.code ? row.code : '-'),
  },
  {
    name: 'actions',
    label: '操作',
    align: 'center',
    field: 'actions',
  },
];

const permColumns: QTableProps['columns'] = [
  {
    name: 'name',
    label: '权限名称',
    align: 'left',
    field: 'name',
  },
  {
    name: 'code',
    label: '权限代码',
    align: 'left',
    field: 'code',
  },
  {
    name: 'tags',
    label: '标签',
    align: 'left',
    field: 'tags',
  },
  {
    name: 'roles',
    label: '权限来源角色',
    align: 'left',
    field: 'roles',
  },
  {
    name: 'application',
    label: '所属应用',
    align: 'left',
    field: 'application',
  },
  {
    name: 'is_deleted',
    label: '状态',
    align: 'center',
    field: 'is_deleted',
    sortable: true,
  },
];

export default defineComponent({
  name: 'UserProfile',

  mixins: [UserOperationsMixin],

  props: {
    userId: {
      type: String,
      default: null,
    },
    tab: {
      type: String,
      default: 'user',
    },
  },

  setup() {
    return {
      user: ref<User>({
        id: '',
      }),
      panelTab: ref('user'),
      roleColumns: roleColumns,
      deptColumns: deptColumns,
      permColumns: permColumns,

      userForm: ref(false),
      userFormData: ref<UserPostData>({}),
      userFormError: ref<UserPostError>({}),
    };
  },

  mounted() {
    this.panelTab = this.tab ? this.tab : this.panelTab;
    this.loadUserInfo();
  },

  methods: {
    async loadUserInfo() {
      const resp = await this.$api.get(`/users/${this.userId}`);
      this.user = resp.data;
      this.userFormData = Object.assign({}, resp.data);
    },

    switchPanelTab(val: string) {
      if (val === 'perms') {
        setTimeout(() => {
          const et = this.$refs.permTable as DataTableComponent;
          et.setApiInfo(`/users/${this.user.id}/permissions`, 'POST');
          et.fetchRows();
        }, 20);
      }
    },

    refreshUserData(op: string) {
      if (['disable', 'enable', 'resign', 'unbind'].includes(op)) {
        this.loadUserInfo();
      } else if (op === 'delete') {
        (this.$refs.profile as ProfileComponent).goBack();
      }
    },

    async saveUserForm() {
      if (JSON.stringify(this.user) === JSON.stringify(this.userFormData))
        return;
      try {
        this.userFormError = {};
        const resp = await this.$api.put(
          `/users/${this.user.id}`,
          this.userFormData,
          {
            successMsg: '角色更新成功',
          }
        );
        this.user = resp.data;
        this.userFormData = Object.assign({}, resp.data);
        this.userFormError = {};
      } catch (e) {
        this.userFormError = (e as Error).cause || {};
      }
    },

    openSetRolesForm() {
      (this.$refs.setRolesForm as SetRolesComponent).show(this.user);
    },

    openSetOrganizationsForm() {
      (this.$refs.setOrganizationsForm as SetOrganizationsComponent).show(
        this.user
      );
    },
  },
});
</script>
