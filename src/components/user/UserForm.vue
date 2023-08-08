<template>
  <!-- dialog form for creating -->
  <form-dialog
    v-if="action === FormAction.create"
    ref="userDialog"
    v-model="userFormDialog"
    title="创建用户"
    width="450px"
    @confirm="createUser"
    @close="resetUserForm"
  >
    <template #form-content>
      <user-form-content
        v-model="userFormData"
        :form-error="userFormError"
        class="q-pa-md"
      />
    </template>
  </form-dialog>

  <!-- page form for updating -->
  <q-card v-if="action === FormAction.update" flat bordered class="q-pa-sm">
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
          @click="updateUser"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { mapActions, mapState } from 'pinia';

import { FormDialogComponent } from 'components/dialog/type';
import { FormAction } from 'components/form/type';
import { authStore } from 'stores/auth-store';

import { User, UserPostData, UserPostError } from './type';

export default defineComponent({
  name: 'UserForm',

  props: {
    /** 用户表单操作类型：创建或更新 */
    action: {
      type: String as PropType<FormAction>,
      default: FormAction.create,
    },
    /** 待更新的用户 */
    user: {
      type: Object as PropType<User>,
      default: () => {
        return {};
      },
    },
  },

  emits: ['refresh'],

  setup() {
    return {
      FormAction,
      userFormDialog: ref(false),
      userFormData: ref<UserPostData>({
        reset_pwd_on_first_login: false,
        send_first_login_email: false,
      }),
      userFormError: ref<UserPostError>({}),
      userPreviousData: ref<UserPostData>({}),
    };
  },

  computed: {
    ...mapState(authStore, ['currentUser']),
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

  methods: {
    ...mapActions(authStore, ['fetchProfile']),

    show() {
      this.userFormDialog = true;
    },

    async createUser() {
      try {
        await this.$api.post('/users', this.userFormData, {
          successMsg: '用户创建成功',
        });
        (this.$refs.userDialog as FormDialogComponent).hide();
        this.$emit('refresh');
        this.resetUserForm();
      } catch (e) {
        this.userFormError = (e as Error).cause || {};
      }
    },

    async updateUser() {
      if (
        JSON.stringify(this.userPreviousData) ===
        JSON.stringify(this.userFormData)
      )
        return;
      try {
        await this.$api.put(`/users/${this.user.id}`, this.userFormData, {
          successMsg: '用户信息更新成功',
        });
        if (this.currentUser.id === this.user.id) {
          await this.fetchProfile();
        }
        this.$emit('refresh');
        this.userFormError = {};
      } catch (e) {
        this.userFormError = (e as Error).cause || {};
      }
    },

    resetUserForm() {
      this.userFormData = {
        reset_pwd_on_first_login: false,
        send_first_login_email: false,
      };
      this.userFormError = {};
    },
  },
});
</script>

<style lang="scss" scoped></style>
