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
          <field-label name="关联角色" />
          <q-select
            v-model="selectedRoles"
            :options="availableRoleOptions"
            dense
            filled
            class="full-width"
            option-label="name"
            option-value="id"
            multiple
            use-chips
          >
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-chip
                    square
                    size="12px"
                    :label="!scope.opt.is_deleted ? '正常' : '禁用'"
                    class="text-weight-bold q-pa-sm"
                    :class="
                      !scope.opt.is_deleted
                        ? 'chip-status-on'
                        : 'chip-status-off'
                    "
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{ scope.opt.name }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip
                    square
                    size="12px"
                    :label="
                      !scope.opt.org_type
                        ? '全局角色'
                        : scope.opt.org_type.name + '角色'
                    "
                    class="q-pa-sm bg-secondary"
                  />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
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

import { Role } from 'pages/role/type';
import { User } from 'pages/user/type';

import { FormDialogComponent } from '../dialog/type';

import { SetRolesPostData, SetRolesPostError } from './type';

export default defineComponent({
  name: 'SetRolesForm',

  emits: ['userUpdated'],

  setup() {
    return {
      user: ref<User>({ id: '' }),
      selectedRoles: ref<Role[]>([]),
      availableRoleOptions: ref<Role[]>([]),
      setRolesForm: ref(false),
      setRolesFormData: ref<SetRolesPostData>({}),
      setRolesFormError: ref<SetRolesPostError>({}),
    };
  },

  methods: {
    show(user: User) {
      this.user = user;
      this.loadAvailableRoles();
      this.setRolesForm = true;
      this.selectedRoles = user.roles || [];
    },

    async loadAvailableRoles() {
      const params = this.user.org_type?.id
        ? { org_type_id: this.user.org_type.id }
        : { include_org_type_roles: false };
      const resp = await this.$api.post('/roles/query', params);
      this.availableRoleOptions = resp.data.rows;
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
