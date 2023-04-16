<template>
  <q-page class="full-width q-pa-md">
    <data-table
      :columns="columns"
      api-url="/users/query"
      api-method="POST"
      sticky-action-column
      :actions="['批量禁用', '批量启用', '批量删除']"
    >
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

      <template #table-action>
        <q-btn
          unelevated
          label="创建用户"
          class="q-ml-md primary-btn"
          @click="createUserForm = true"
        />
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props">
          <div class="text-grey-8 q-gutter-xs">
            <q-btn size="12px" flat dense icon="more_horiz" class="flat-btn">
              <q-menu class="q-px-xs">
                <q-list dense>
                  <q-item
                    v-if="props.row.status"
                    v-close-popup
                    clickable
                    class="q-my-xs"
                    @click="disableUser(props.row)"
                  >
                    <q-item-section avatar class="q-pr-none">
                      <q-icon name="remove_circle_outline" size="16px" />
                    </q-item-section>
                    <q-item-section> 禁用账号 </q-item-section>
                  </q-item>
                  <q-item
                    v-else
                    v-close-popup
                    clickable
                    class="q-my-xs"
                    @click="enableUser(props.row)"
                  >
                    <q-item-section avatar class="q-pr-none">
                      <q-icon name="task_alt" size="16px" />
                    </q-item-section>
                    <q-item-section> 启用账号 </q-item-section>
                  </q-item>
                  <!-- <q-separator inset /> -->
                  <q-item
                    v-close-popup
                    clickable
                    class="q-my-xs"
                    @click="deleteUser(props.row)"
                  >
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

    <!--Dialogs-->
    <form-dialog
      ref="createUserDialog"
      v-model="createUserForm"
      title="创建新用户"
      width="450px"
      @confirm="createUser"
    >
      <template #form-content>
        <div class="q-gutter-md q-pa-md">
          <div>
            <q-item-label class="text-caption input-label">
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
              />
              <q-input
                v-model="newUser.mobile"
                filled
                dense
                placeholder="请填写手机号"
                hide-bottom-space
                class="col"
              />
              <q-input
                v-model="newUser.email"
                filled
                dense
                placeholder="请填写邮箱"
                hide-bottom-space
                class="col"
              />
            </div>
            <div
              v-if="!isValid && isSubmitted"
              class="error-hint text-negative"
            >
              用户名、手机、邮箱至少填写1项
            </div>
          </div>
          <q-separator />
          <div>
            <q-item-label class="text-caption input-label">
              用户姓名（选填）
            </q-item-label>
            <q-input
              v-model="newUser.name"
              filled
              dense
              placeholder="请填写用户姓名"
              hide-bottom-space
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
import DataTable from 'components/table/DataTable.vue';

import { User } from './type';

const columns: QTableProps['columns'] = [
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

export default defineComponent({
  name: 'UserAdminPanel',

  components: { DataTable, FormDialog },

  setup() {
    return {
      columns: columns,
      createUserForm: ref(false),
      isSubmitted: ref(false),
      firstLoginNotification: ref(true),
      passwordChangingRequired: ref(false),
      newUser: ref({
        username: '',
        mobile: '',
        email: '',
        name: '',
      }),
    };
  },

  computed: {
    isValid() {
      return (
        this.newUser.username !== '' ||
        this.newUser.mobile !== '' ||
        this.newUser.email !== ''
      );
    },
  },

  methods: {
    disableUser(item: User) {
      const userDesc =
        item.name + (item.mobile ? '（' + item.mobile + '）' : '');
      this.$q
        .dialog({
          component: ConfirmDialog,
          componentProps: {
            title: '禁用成员',
            content:
              '您正在请求禁用成员：' +
              userDesc +
              '，操作后，该成员将无法登录系统及重置密码，但您仍可在后台对该账号进行编辑及重新启用。',
            buttons: [
              { label: '取消' },
              {
                label: '禁用',
                actionsType: 'disable',
                class: 'accent-btn',
              },
            ],
          },
        })
        .onOk(async ({ type }) => {
          if (type === 'disable') {
          }
        });
    },

    enableUser(item: User) {
      const userDesc =
        item.name + (item.mobile ? '（' + item.mobile + '）' : '');
      this.$q
        .dialog({
          component: ConfirmDialog,
          componentProps: {
            title: '恢复成员',
            content:
              '您正在请求启用成员：' +
              userDesc +
              '，操作后，账号状态将恢复正常，用户可以重新登录系统。',
            buttons: [
              { label: '取消' },
              {
                label: '恢复',
                actionsType: 'enable',
                class: 'accent-btn',
              },
            ],
          },
        })
        .onOk(async ({ type }) => {
          if (type === 'enable') {
          }
        });
    },

    createUser() {
      this.isSubmitted = true;
    },

    deleteUser(item: User) {
      const userDesc =
        item.name + (item.mobile ? '（' + item.mobile + '）' : '');
      this.$q
        .dialog({
          component: ConfirmDialog,
          componentProps: {
            title: '删除成员',
            content:
              '您正在请求删除成员：' +
              userDesc +
              '，数据删除后将无法进行恢复，您确认要继续删除吗？',
            buttons: [
              { label: '取消' },
              {
                label: '删除',
                actionsType: 'delete',
                class: 'accent-btn',
              },
            ],
          },
        })
        .onOk(async ({ type }) => {
          if (type === 'delete') {
            // try {
            //   await this.$api.delete(`/users/${row.id}`, {
            //     successMsg: '已删除成员：' + row.name,
            //   });
            // } finally {
            //   this.$refs.table.onUpdateRow();
            // }
          }
        });
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
