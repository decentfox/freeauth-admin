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
        v-model:username="userFormData.username"
        v-model:name="userFormData.name"
        v-model:mobile="userFormData.mobile"
        v-model:email="userFormData.email"
        :form-data="userFormData"
        :form-error="userFormError"
        class="q-pa-md"
      />
    </template>
  </form-dialog>

  <!-- page form for updating -->
  <q-card v-if="action === FormAction.update" flat bordered class="q-pa-sm">
    <q-form>
      <user-form-content
        v-model:username="userFormData.username"
        v-model:name="userFormData.name"
        v-model:mobile="userFormData.mobile"
        v-model:email="userFormData.email"
        :action="FormAction.update"
        :form-data="userFormData"
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

import { User, UserPostData, UserPostError } from 'pages/user/type';

import { FormDialogComponent } from '../dialog/type';
import { FormAction } from '../form/type';

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
      userFormData: ref<UserPostData>({}),
      userFormError: ref<UserPostError>({}),
      userPreviousData: ref<UserPostData>({}),
    };
  },

  watch: {
    user() {
      this.userFormData = {
        username: this.user.name,
        mobile: this.user.mobile,
        email: this.user.email,
        name: this.user.name,
      };
      this.userPreviousData = Object.assign({}, this.userFormData);
    },
  },

  methods: {
    show() {
      this.userFormDialog = true;
    },

    async createUser() {
      try {
        this.userFormError = {};
        await this.$api.post('/users', this.userFormData, {
          successMsg: '用户创建成功',
        });
        (this.$refs.userDialog as FormDialogComponent).hide();
        this.$emit('refresh');
        this.resetUserForm;
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
        this.userFormError = {};
        await this.$api.put(`/users/${this.user.id}`, this.userFormData, {
          successMsg: '角色更新成功',
        });
        this.$emit('refresh');
        this.userFormError = {};
      } catch (e) {
        this.userFormError = (e as Error).cause || {};
      }
    },

    resetUserForm() {
      this.userFormData = {};
      this.userFormError = {};
    },
  },
});
</script>

<style lang="scss" scoped></style>
