<template>
  <!-- dialog form for creating -->
  <form-dialog
    v-if="action === FormAction.create"
    ref="permissionDialog"
    v-model="permissionFormDialog"
    title="创建权限"
    width="450px"
    @confirm="createPermission"
    @close="resetPermissionForm"
  >
    <template #form-content>
      <perm-form-content
        v-model:name="permissionFormData.name"
        v-model:code="permissionFormData.code"
        v-model:tags="permissionFormData.tags"
        v-model:description="permissionFormData.description"
        v-model:application_id="permissionFormData.application_id"
        :app-id="appId"
        :form-data="permissionFormData"
        :form-error="permissionFormError"
      />
    </template>
  </form-dialog>

  <!-- page form for updating -->
  <q-card v-if="action === FormAction.update" flat bordered class="q-pa-sm">
    <q-form>
      <perm-form-content
        v-model:name="permissionFormData.name"
        v-model:code="permissionFormData.code"
        v-model:tags="permissionFormData.tags"
        v-model:description="permissionFormData.description"
        v-model:application_id="permissionFormData.application_id"
        :action="FormAction.update"
        :form-data="permissionFormData"
        :form-error="permissionFormError"
      />
      <q-card-actions class="q-px-md">
        <q-btn
          unelevated
          class="primary-btn"
          label="保存"
          @click="updatePermission"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

import { FormDialogComponent } from '../dialog/type';
import { FormAction } from '../form/type';

import { Permission, PermissionPostData, PermissionPostError } from './type';

export default defineComponent({
  name: 'PermForm',

  props: {
    /** 指定权限所属应用 */
    appId: {
      type: String,
      default: '',
    },
    /** 权限表单操作类型：创建或更新 */
    action: {
      type: String as PropType<FormAction>,
      default: FormAction.create,
    },
    /** 待更新的权限 */
    permission: {
      type: Object as PropType<Permission>,
      default: () => {
        return {};
      },
    },
  },

  emits: ['refresh'],

  setup() {
    return {
      FormAction,
      permissionFormDialog: ref(false),
      permissionFormData: ref<PermissionPostData>({}),
      permissionFormError: ref<PermissionPostError>({}),
      permissionPreviousData: ref<PermissionPostData>({}),
    };
  },

  watch: {
    permission() {
      this.permissionFormData = {
        application_id: this.permission.application?.id,
        name: this.permission.name,
        code: this.permission.code,
        description: this.permission.description,
        tags: this.permission.tags?.map((p) => p.name),
      };
      this.permissionPreviousData = Object.assign({}, this.permissionFormData);
    },
  },

  methods: {
    show() {
      this.permissionFormDialog = true;
      this.permissionFormData.application_id = this.appId ? this.appId : '';
    },

    async createPermission() {
      try {
        this.permissionFormError = {};
        await this.$api.post('/permissions', this.permissionFormData, {
          successMsg: '权限创建成功',
        });
        (this.$refs.permissionDialog as FormDialogComponent).hide();
        this.$emit('refresh');
        this.resetPermissionForm();
      } catch (e) {
        this.permissionFormError = (e as Error).cause || {};
      }
    },

    async updatePermission() {
      if (
        JSON.stringify(this.permissionPreviousData) ===
        JSON.stringify(this.permissionFormData)
      )
        return;
      try {
        this.permissionFormError = {};
        await this.$api.put(
          `/permissions/${this.permission.id}`,
          this.permissionFormData,
          {
            successMsg: '权限更新成功',
          }
        );
        this.$emit('refresh');
        this.permissionFormError = {};
      } catch (e) {
        this.permissionFormError = (e as Error).cause || {};
      }
    },

    resetPermissionForm() {
      this.permissionFormData = {};
      this.permissionFormError = {};
    },
  },
});
</script>

<style lang="scss" scoped></style>
