<template>
  <!-- dialog form for creating -->
  <form-dialog
    v-if="action === FormAction.create"
    ref="roleDialog"
    v-model="roleFormDialog"
    title="创建角色"
    width="450px"
    @confirm="createRole"
    @close="resetRoleForm"
  >
    <template #form-content>
      <role-form-content
        v-model:org_type_id="roleFormData.org_type_id"
        v-model:name="roleFormData.name"
        v-model:code="roleFormData.code"
        v-model:description="roleFormData.description"
        :form-data="roleFormData"
        :form-error="roleFormError"
      />
    </template>
  </form-dialog>

  <!-- page form for updating -->
  <q-card v-if="action === FormAction.update" flat bordered class="q-pa-sm">
    <q-form>
      <role-form-content
        v-model:org_type_id="roleFormData.org_type_id"
        v-model:name="roleFormData.name"
        v-model:code="roleFormData.code"
        v-model:description="roleFormData.description"
        :action="FormAction.update"
        :form-data="roleFormData"
        :form-error="roleFormError"
      />
      <q-card-actions class="q-px-md">
        <q-btn
          unelevated
          class="primary-btn"
          label="保存"
          @click="updateRole"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

import { FormDialogComponent } from '../dialog/type';
import { FormAction } from '../form/type';

import { Role, RolePostData, RolePostError } from './type';

export default defineComponent({
  name: 'RoleForm',

  props: {
    /** 角色表单操作类型：创建或更新 */
    action: {
      type: String as PropType<FormAction>,
      default: FormAction.create,
    },
    /** 待更新的角色 */
    role: {
      type: Object as PropType<Role>,
      default: () => {
        return {};
      },
    },
  },

  emits: ['refresh'],

  setup() {
    return {
      FormAction,
      roleFormDialog: ref(false),
      roleFormData: ref<RolePostData>({}),
      roleFormError: ref<RolePostError>({}),
      rolePreviousData: ref<RolePostData>({}),
    };
  },

  watch: {
    role() {
      this.roleFormData = {
        org_type_id: this.role.org_type?.id,
        name: this.role.name,
        code: this.role.code,
        description: this.role.description,
      };
      this.rolePreviousData = Object.assign({}, this.roleFormData);
    },
  },

  methods: {
    show() {
      this.roleFormDialog = true;
    },

    async createRole() {
      try {
        this.roleFormError = {};
        await this.$api.post('/roles', this.roleFormData, {
          successMsg: '角色创建成功',
        });
        (this.$refs.roleDialog as FormDialogComponent).hide();
        this.$emit('refresh');
        this.resetRoleForm();
      } catch (e) {
        this.roleFormError = (e as Error).cause || {};
      }
    },

    async updateRole() {
      if (
        JSON.stringify(this.rolePreviousData) ===
        JSON.stringify(this.roleFormData)
      )
        return;
      try {
        this.roleFormError = {};
        await this.$api.put(`/roles/${this.role.id}`, this.roleFormData, {
          successMsg: '角色更新成功',
        });
        this.$emit('refresh');
        this.roleFormError = {};
      } catch (e) {
        this.roleFormError = (e as Error).cause || {};
      }
    },

    resetRoleForm() {
      this.roleFormData = {};
      this.roleFormError = {};
    },
  },
});
</script>

<style lang="scss" scoped></style>
