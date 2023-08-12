<!--
  Copyright (c) 2016-present DecentFoX Studio and the FreeAuth authors.
  FreeAuth is licensed under Mulan PSL v2.
  You can use this software according to the terms and conditions of the Mulan PSL v2.
  You may obtain a copy of Mulan PSL v2 at:
           http://license.coscl.org.cn/MulanPSL2
  THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
  EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
  MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
  See the Mulan PSL v2 for more details.
-->
<template>
  <form-dialog
    ref="setRolesDialog"
    v-model="setRolesForm"
    title="配置角色"
    width="450px"
    @confirm="saveSetRolesForm"
    @close="resetSetRolesForm"
  >
    <template #form-content>
      <div class="q-gutter-md q-pa-md">
        <div>
          <field-label text="关联角色" />
          <searchable-multiple-select
            v-model="selectedRoles"
            placeholder="输入角色名称进行搜索"
            option-api-url="/roles/query"
            :option-api-params="
              user.org_type?.id
                ? { org_type_id: user.org_type.id }
                : { include_org_type_roles: false }
            "
          />
        </div>
        <div v-if="user.org_type" class="text-caption hint-label">
          提示：仅能选择全局角色或该用户所属组织类型【{{
            user.org_type.name
          }}】下的角色。
        </div>
        <div v-else class="text-caption hint-label">
          提示：该用户尚未归属任何组织，仅能选择全局角色进行关联。
        </div>
      </div>
    </template>
  </form-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import { FormDialogComponent } from '../dialog/type';
import { Role } from '../role/type';

import { SetRolesPostData, SetRolesPostError, User } from './type';

export default defineComponent({
  name: 'SetRolesForm',

  emits: ['userUpdated'],

  setup() {
    return {
      user: ref<User>({ id: '' }),
      selectedRoles: ref<Role[]>([]),
      setRolesForm: ref(false),
      setRolesFormData: ref<SetRolesPostData>({}),
      setRolesFormError: ref<SetRolesPostError>({}),
    };
  },

  methods: {
    show(user: User) {
      this.user = user;
      this.setRolesForm = true;
      this.selectedRoles = user.roles || [];
    },

    async saveSetRolesForm() {
      this.setRolesFormData.user_id = this.user.id;
      this.setRolesFormData.role_ids = this.selectedRoles.map(
        (role) => role.id
      );
      try {
        this.setRolesFormError = {};
        await this.$api.put(
          `/users/${this.setRolesFormData.user_id}/roles`,
          this.setRolesFormData,
          {
            successMsg: '角色配置成功',
          }
        );
        (this.$refs.setRolesDialog as FormDialogComponent).hide();
        this.$emit('userUpdated');
        this.resetSetRolesForm();
      } catch (e) {
        this.selectedRoles = this.user.roles || [];
        this.setRolesFormError = (e as Error).cause || {};
      }
    },

    resetSetRolesForm() {
      this.setRolesFormData = {};
      this.setRolesFormError = {};
      this.selectedRoles = [];
    },
  },
});
</script>

<style lang="scss" scoped></style>
