<template>
  <form-dialog
    ref="transferDialog"
    v-model="transferForm"
    title="配置组织"
    width="450px"
    @confirm="saveTransferForm"
    @close="resetTransferForm"
  >
    <template #form-content>
      <div class="q-gutter-md q-pa-md">
        <div v-if="!user.org_type">
          <field-label text="组织类型" required />
          <q-select
            v-model="selectedOrgTypeId"
            :options="orgTypeOptions"
            dense
            filled
            class="full-width"
            option-label="name"
            option-value="id"
            emit-value
            map-options
            hide-bottom-space
            :disable="!!user.org_type"
            @update:model-value="loadOrgTree"
          />
        </div>
        <div>
          <field-label text="组织归属" required />
          <tree-select
            v-model="transferFormData.organization_ids"
            :nodes="orgTreeData"
            multi-select
            :initial-selected-items="parentDepartment"
          />
          <div
            v-if="!!transferFormError.organization_ids"
            class="error-hint text-negative"
          >
            {{ transferFormError.organization_ids }}
          </div>
        </div>
        <div class="text-caption hint-label">
          提示：如需彻底移除所有组织归属，请点击【办理离职】。
        </div>
      </div>
    </template>
  </form-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { QTreeNode } from 'quasar';

import { FormDialogComponent } from '../dialog/type';
import { OrgType } from '../organization/type';

import {
  SetOrganizationsPostData,
  SetOrganizationsPostError,
  User,
} from './type';

export default defineComponent({
  name: 'SetOrgsForm',

  emits: ['userUpdated'],

  setup() {
    return {
      user: ref<User>({ id: '' }),
      orgTreeData: ref<QTreeNode[]>([]),
      parentDepartment: ref<QTreeNode[]>([]),
      orgTypeOptions: ref<OrgType[]>([]),
      selectedOrgTypeId: ref(''),

      transferForm: ref(false),
      transferFormData: ref<SetOrganizationsPostData>({}),
      transferFormError: ref<SetOrganizationsPostError>({}),
    };
  },

  methods: {
    show(user: User) {
      this.user = user;
      this.transferForm = true;
      this.loadOrgTypes();
      if (user.departments?.length !== 0) {
        this.parentDepartment = user.departments as QTreeNode[];
        this.transferFormData.organization_ids = user.departments?.map(
          (d) => d.id
        );
      }
    },

    async saveTransferForm() {
      this.transferFormData.user_id = this.user.id;
      this.transferFormData.org_type_id = this.selectedOrgTypeId;
      try {
        this.transferFormError = {};
        await this.$api.put(
          `/users/${this.transferFormData.user_id}/organizations`,
          this.transferFormData,
          {
            successMsg: '组织归属变更成功',
          }
        );
        (this.$refs.transferDialog as FormDialogComponent).hide();
        this.$emit('userUpdated');
        this.resetTransferForm();
      } catch (e) {
        this.transferFormError = (e as Error).cause || {};
      }
    },

    resetTransferForm() {
      this.transferFormData = {};
      this.transferFormError = {};
      this.parentDepartment = [];
    },

    async loadOrgTypes() {
      const resp = await this.$api.get('/org_types');
      this.orgTypeOptions = resp.data.org_types;
      this.selectedOrgTypeId = this.user.org_type?.id
        ? this.user.org_type.id
        : this.orgTypeOptions[0].id;
      this.loadOrgTree(this.selectedOrgTypeId);
    },

    async loadOrgTree(org_type_id: string) {
      this.transferFormData.organization_ids = [];
      const resp = await this.$api.get(
        `/org_types/${org_type_id}/organization_tree`
      );
      this.orgTreeData = resp.data;
    },
  },
});
</script>

<style lang="scss" scoped></style>
