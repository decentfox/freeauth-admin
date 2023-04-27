<template>
  <q-page class="full-width q-pa-md">
    <data-table
      ref="table"
      :columns="columns"
      api-url="/users/query"
      api-method="POST"
      sticky-action-column
      :filter-columns="filterColumns"
      :batch-actions="['批量禁用', '批量启用', '批量删除']"
      @批量禁用="(selected) => disableUsers(selected)"
      @批量启用="(selected) => enableUsers(selected)"
      @批量删除="(selected) => deleteUsers(selected)"
    >
      <template #table-action>
        <q-btn
          unelevated
          dense
          label="创建用户"
          class="q-ml-sm q-px-md primary-btn"
          @click="createUserForm = true"
        />
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
                  label: !props.row.is_deleted ? '禁用账号' : '启用账号',
                  icon: !props.row.is_deleted
                    ? 'remove_circle_outline'
                    : 'task_alt',
                  actionType: !props.row.is_deleted ? 'disable' : 'enable',
                },
                {
                  label: '删除账号',
                  icon: 'delete_outline',
                  actionType: 'delete',
                },
              ]"
              @menu-click="operateOneUser($event, [props.row])"
            />
          </div>
        </q-td>
      </template>
    </data-table>

    <!--Dialogs-->
    <form-dialog
      ref="createUserDialog"
      v-model="createUserForm"
      title="创建新用户"
      width="450px"
      @confirm="createUser"
      @close="resetCreateUserForm"
    >
      <template #form-content>
        <div class="q-gutter-md q-pa-md">
          <div>
            <q-item-label class="text-caption hint-label">
              登录信息（至少填写1项）
            </q-item-label>
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
              />
            </div>
            <div
              v-if="!!createUserFormError.__root__"
              class="error-hint text-negative"
            >
              {{ createUserFormError.__root__ }}
            </div>
          </div>
          <q-separator />
          <div>
            <q-item-label class="text-caption hint-label">
              用户姓名（选填）
            </q-item-label>
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
              v-model="firstLoginNotification"
              label="发送首次登录信息（系统自动生成初始密码）"
            />
            <q-toggle
              v-model="passwordChangingRequired"
              label="强制用户在首次登录时修改密码"
            />
          </div>
        </div>
      </template>
    </form-dialog>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { date, QTableProps } from 'quasar';

import ConfirmDialog from 'components/dialog/ConfirmDialog.vue';
import FormDialog from 'components/dialog/FormDialog.vue';
import { FormDialogComponent } from 'components/dialog/type';
import DropdownButton from 'components/DropdownButton.vue';
import DataTable from 'components/table/DataTable.vue';
import {
  DataTableComponent,
  FilterColumn,
  FilterOperator,
} from 'components/table/type';

import { User, UserPostData, UserPostError } from './type';

const columns: QTableProps['columns'] = [
  {
    name: 'name',
    label: '姓名',
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'username',
    label: '用户名',
    align: 'left',
    field: 'username',
    sortable: true,
  },
  {
    name: 'mobile',
    label: '手机号',
    align: 'left',
    field: 'mobile',
    sortable: true,
  },
  {
    name: 'email',
    label: '邮箱',
    align: 'left',
    field: 'email',
    sortable: true,
  },
  {
    name: 'last_login_at',
    label: '最后登录时间',
    align: 'left',
    field: (row) =>
      row.last_login_at
        ? date.formatDate(
            new Date(row.last_login_at).toLocaleString(),
            'YYYY-MM-DD HH:mm:ss'
          )
        : null,
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
    label: '姓名',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.ct,
      FilterOperator.nct,
    ],
  },
  {
    field: 'username',
    label: '用户名',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.ct,
      FilterOperator.nct,
    ],
  },
  {
    field: 'mobile',
    label: '手机号',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.ct,
      FilterOperator.nct,
    ],
  },
  {
    field: 'email',
    label: '邮箱',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.ct,
      FilterOperator.nct,
    ],
  },
  {
    field: 'last_login_at',
    label: '最后登录时间',
    type: 'datetime',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.gt,
      FilterOperator.gte,
      FilterOperator.lt,
      FilterOperator.lte,
    ],
  },
  {
    field: 'created_at',
    label: '创建时间',
    type: 'datetime',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.gt,
      FilterOperator.gte,
      FilterOperator.lt,
      FilterOperator.lte,
    ],
  },
  {
    field: 'is_deleted',
    label: '状态',
    type: 'select',
    operatorOptions: [FilterOperator.eq, FilterOperator.neq],
    options: [
      { value: false, label: '正常' },
      { value: true, label: '禁用' },
    ],
  },
];

export default defineComponent({
  name: 'UserAdminPanel',

  components: { DataTable, DropdownButton, FormDialog },

  setup() {
    return {
      columns: columns,
      filterColumns: filterColumns,
      createUserForm: ref(false),
      createUserFormError: ref<UserPostError>({}),
      firstLoginNotification: ref(true),
      passwordChangingRequired: ref(false),
      newUser: ref<UserPostData>({}),
    };
  },

  methods: {
    async toggleUsersStatus(user_ids: string[], is_deleted: boolean) {
      try {
        await this.$api.put(
          '/users/status',
          { user_ids, is_deleted },
          { successMsg: `${is_deleted ? '禁用' : '启用'}成员成功` }
        );
      } finally {
        (this.$refs.table as DataTableComponent).fetchRows();
      }
    },

    async executeDeleteUsers(user_ids: string[]) {
      try {
        await this.$api.request({
          method: 'DELETE',
          url: '/users',
          data: { user_ids },
          successMsg: '成员删除成功',
        });
      } finally {
        (this.$refs.table as DataTableComponent).fetchRows();
      }
    },

    async createUser() {
      try {
        this.createUserFormError = {};
        await this.$api.post('/users', this.newUser, {
          successMsg: '成员创建成功',
        });
        (this.$refs.createUserDialog as FormDialogComponent).hide();
        (this.$refs.table as DataTableComponent).fetchRows();
        this.resetCreateUserForm();
      } catch (e) {
        this.createUserFormError = (e as Error).cause || {};
      }
    },

    resetCreateUserForm() {
      this.createUserFormError = {};
      this.newUser = {};
    },

    disableUsers(users: User[]) {
      const userDesc = `${users[0].name || users[0].username}${
        users[0].mobile ? `（${users[0].mobile}）` : ''
      }${users.length > 1 ? `等 ${users.length} 人` : ''}`;
      this.$q
        .dialog({
          component: ConfirmDialog,
          componentProps: {
            title: '禁用成员',
            content: `您正在请求禁用成员：${userDesc}，操作后，该成员将无法登录系统及重置密码，但您仍可在后台对该账号进行编辑及重新启用。`,
            buttons: [
              { label: '取消' },
              {
                label: '禁用',
                actionType: 'disable',
                class: 'accent-btn',
              },
            ],
          },
        })
        .onOk(({ type }) => {
          if (type === 'disable') {
            this.toggleUsersStatus(
              users.map((u: User) => u.id),
              true
            );
          }
        });
    },

    enableUsers(users: User[]) {
      const userDesc = `${users[0].name || users[0].username}${
        users[0].mobile ? `（${users[0].mobile}）` : ''
      }${users.length > 1 ? `等 ${users.length} 人` : ''}`;
      this.$q
        .dialog({
          component: ConfirmDialog,
          componentProps: {
            title: '恢复成员',
            content: `您正在请求启用成员：${userDesc}，操作后，账号状态将恢复正常，用户可以重新登录系统。`,
            buttons: [
              { label: '取消' },
              {
                label: '恢复',
                actionType: 'enable',
                class: 'accent-btn',
              },
            ],
          },
        })
        .onOk(({ type }) => {
          if (type === 'enable') {
            this.toggleUsersStatus(
              users.map((u: User) => u.id),
              false
            );
          }
        });
    },

    deleteUsers(users: User[]) {
      const userDesc = `${users[0].name || users[0].username}${
        users[0].mobile ? `（${users[0].mobile}）` : ''
      }${users.length > 1 ? `等 ${users.length} 人` : ''}`;

      this.$q
        .dialog({
          component: ConfirmDialog,
          componentProps: {
            title: '删除成员',
            content: `您正在请求删除成员：${userDesc}，数据删除后将无法进行恢复，您确认要继续删除吗？`,
            buttons: [
              { label: '取消' },
              {
                label: '删除',
                actionType: 'delete',
                class: 'accent-btn',
              },
            ],
          },
        })
        .onOk(({ type }) => {
          if (type === 'delete') {
            this.executeDeleteUsers(users.map((u: User) => u.id));
          }
        });
    },

    operateOneUser(event: Event, users: User[]) {
      if (event.type === 'disable') {
        this.disableUsers(users);
      } else if (event.type === 'enable') {
        this.enableUsers(users);
      } else if (event.type === 'delete') {
        this.deleteUsers(users);
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.error-hint {
  font-size: 11px;
  padding: 8px 0 0 12px;
}
</style>
