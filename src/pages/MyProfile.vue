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
    ]"
  >
    <template #toolbar-right>
      <div>
        <q-btn
          unelevated
          dense
          :disable="!user.email"
          class="primary-btn q-px-md"
          label="修改密码"
          @click="pwdFormDialog = true"
        />
        <q-tooltip anchor="bottom right" self="top right">
          新密码以邮件形式进行发送，请先补充邮箱信息
        </q-tooltip>
      </div>
    </template>
    <template #panels>
      <q-tab-panel name="user">
        <q-card flat bordered class="q-pa-sm">
          <q-form>
            <user-form-content
              v-model="userFormData"
              :action="FormAction.update"
              :form-error="userFormError"
              class="q-pa-md"
            />
            <q-card-actions class="q-px-md">
              <q-btn
                unelevated
                class="primary-btn"
                label="保存"
                @click="updateProfile"
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
              <chip-group :chips="[props.row.org_type]" square />
            </q-td>
          </template>
          <template #body-cell-enterprise="props">
            <q-td :props="props">
              <chip-group
                :chips="
                  props.row.enterprise ? [props.row.enterprise] : [props.row]
                "
                square
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
              <chip-group
                :chips="props.row.org_type ? [props.row.org_type] : []"
                square
              />
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
          <template #no-data="{ icon, message }">
            <div class="full-width row flex-center q-gutter-sm text-grey-6">
              <q-icon :name="icon" />
              <span>
                {{ message }}
              </span>
            </div>
          </template>
        </q-table>
      </q-tab-panel>
    </template>
    <template #dialog>
      <form-dialog
        ref="pwdDialog"
        v-model="pwdFormDialog"
        title="修改密码"
        width="350px"
        @confirm="changePwd"
        @close="resetPwdForm"
      >
        <template #form-content>
          <div class="q-pa-md q-gutter-md">
            <pwd-field
              v-model="password"
              placeholder="请输入新密码"
              :rules="[(val: string) => val.length >= 6 || '请使用至少 6 位字符作为密码']"
              :error="formError.password"
            />
            <pwd-field
              v-model="repeatPassword"
              placeholder="请再次确认密码"
              :rules="[(val: string) => (!!val && val === password) || '两次输入密码不一致']"
            />
          </div>
        </template>
      </form-dialog>
    </template>
  </profile-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { QTableProps } from 'quasar';

import { FormDialogComponent } from 'components/dialog/type';
import { FormAction } from 'components/form/type';
import { AuthError } from 'components/login/type';
import { User, UserPostData, UserPostError } from 'components/user/type';

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
];

export default defineComponent({
  name: 'MyProfile',

  setup() {
    return {
      user: ref<User>({
        id: '',
      }),
      panelTab: ref('user'),
      roleColumns: roleColumns,
      deptColumns: deptColumns,
      FormAction,
      userFormData: ref<UserPostData>({}),
      userFormError: ref<UserPostError>({}),
      userPreviousData: ref<UserPostData>({}),
      pwdFormDialog: ref(false),
      password: ref<string>(''),
      repeatPassword: ref<string>(''),
      formError: ref<AuthError>({}),
      submitting: ref(false),
    };
  },

  watch: {
    user() {
      this.userFormData = {
        username: this.user.username,
        mobile: this.user.mobile,
        email: this.user.email,
        name: this.user.name,
      };
      this.userPreviousData = Object.assign({}, this.userFormData);
    },
  },

  mounted() {
    this.loadProfileInfo();
  },

  methods: {
    async loadProfileInfo() {
      const resp = await this.$api.get('/me', {
        showProgress: true,
      });
      this.user = resp.data;
    },

    async changePwd() {
      this.submitting = true;
      try {
        await this.$api.post(
          '/change_pwd',
          { password: this.password },
          { successMsg: '密码修改成功' }
        );
        this.resetPwdForm();
        (this.$refs.pwdDialog as FormDialogComponent).hide();
      } catch (e) {
        this.formError = (e as Error).cause || {};
      } finally {
        this.submitting = false;
      }
    },

    resetPwdForm() {
      this.formError = {};
      this.password = '';
      this.repeatPassword = '';
    },

    async updateProfile() {
      if (
        JSON.stringify(this.userPreviousData) ===
        JSON.stringify(this.userFormData)
      )
        return;
      try {
        await this.$api.post('/update_profile', this.userFormData, {
          successMsg: '个人信息更新成功',
        });
        this.userFormError = {};
      } catch (e) {
        this.userFormError = (e as Error).cause || {};
      }
    },
  },
});
</script>
