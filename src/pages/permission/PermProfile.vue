<template>
  <profile-page
    ref="profile"
    v-model:tab-value="panelTab"
    :name="permission.name"
    :status="!permission.is_deleted"
    :tabs="[
      { name: 'perm', label: '基本信息' },
      { name: 'roles', label: '关联角色' },
      { name: 'users', label: '用户列表' },
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
            label: !permission.is_deleted ? '禁用角色' : '启用角色',
            icon: !permission.is_deleted ? 'remove_circle_outline' : 'task_alt',
            actionType: !permission.is_deleted ? 'disable' : 'enable',
          },

          {
            label: '删除角色',
            icon: 'delete_outline',
            actionType: 'delete',
          },
        ]"
        @disable="
          togglePermissionsStatus([permission], true, refreshPermissionData)
        "
        @enable="
          togglePermissionsStatus([permission], false, refreshPermissionData)
        "
        @delete="deletePermissions([permission], refreshPermissionData)"
      />
    </template>
    <template #panels>
      <q-tab-panel name="perm">
        <q-card flat bordered class="q-pa-md">
          <q-form>
            <div class="q-col-gutter-md q-pa-sm">
              <div>
                <field-label name="权限名称" required />
                <q-input
                  v-model="permissionFormData.name"
                  filled
                  dense
                  placeholder="请填写权限名称"
                  hide-bottom-space
                  :error="!!permissionFormError.name"
                  :error-message="permissionFormError.name"
                />
              </div>
              <div>
                <field-label
                  name="权限 Code"
                  required
                  hint="权限的唯一标识符，可用于获取权限信息"
                />
                <q-input
                  v-model="permissionFormData.code"
                  filled
                  dense
                  placeholder="请填写权限代码"
                  hide-bottom-space
                  :error="!!permissionFormError.code"
                  :error-message="permissionFormError.code"
                />
              </div>
              <div>
                <field-label name="权限描述" />
                <q-input
                  v-model="permissionFormData.description"
                  filled
                  dense
                  type="textarea"
                  placeholder="请填写权限描述"
                  hide-bottom-space
                />
              </div>
            </div>
            <q-card-actions>
              <q-btn
                unelevated
                class="primary-btn"
                label="保存"
                @click="savePermissionForm"
              />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-tab-panel>
      <q-tab-panel name="roles"> TODO </q-tab-panel>
      <q-tab-panel name="users"> TODO </q-tab-panel>
    </template>
    <template #dialog> </template>
  </profile-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import { PermOperationsMixin } from 'components/permission/PermOperations';
import { ProfileComponent } from 'layouts/type';

import { Permission, PermissionPostData, PermissionPostError } from './type';

export default defineComponent({
  name: 'PermProfile',

  mixins: [PermOperationsMixin],

  props: {
    permId: {
      type: String,
      default: null,
    },
  },

  setup() {
    return {
      permission: ref<Permission>({
        id: '',
      }),
      panelTab: ref('perm'),

      permissionFormData: ref<PermissionPostData>({}),
      permissionFormError: ref<PermissionPostError>({}),
    };
  },

  mounted() {
    this.loadPermInfo();
  },

  methods: {
    async loadPermInfo() {
      const resp = await this.$api.get(`/permissions/${this.permId}`);
      this.permission = resp.data;
      this.permissionFormData = Object.assign({}, resp.data);
    },

    switchPanelTab() {
      console.error('switch tab');
    },

    async savePermissionForm() {
      if (
        JSON.stringify(this.permission) ===
        JSON.stringify(this.permissionFormData)
      )
        return;
      try {
        this.permissionFormError = {};
        const resp = await this.$api.put(
          `/permissions/${this.permission.id}`,
          this.permissionFormData,
          {
            successMsg: '权限更新成功',
          }
        );
        this.permission = resp.data;
        this.permissionFormData = Object.assign({}, resp.data);
        this.permissionFormError = {};
      } catch (e) {
        this.permissionFormError = (e as Error).cause || {};
      }
    },

    refreshPermissionData(op: string) {
      if (['disable', 'enable'].includes(op)) {
        this.loadPermInfo();
      } else if (op === 'delete') {
        (this.$refs.profile as ProfileComponent).goBack();
      }
    },
  },
});
</script>
