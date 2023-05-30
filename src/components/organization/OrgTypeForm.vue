<template>
  <form-dialog
    ref="orgTypeDialog"
    v-model="orgTypeForm"
    title="组织类型"
    width="450px"
    @confirm="saveOrgTypeForm"
    @close="resetOrgTypeForm"
  >
    <template #form-content>
      <div class="q-gutter-md q-pa-md">
        <div>
          <field-label text="组织类型名称" required />
          <q-input
            v-model="orgTypeFormData.name"
            filled
            dense
            placeholder="请填写组织类型名称，如：合作商家"
            hide-bottom-space
            :error="!!orgTypeFormError.name"
            :error-message="orgTypeFormError.name"
          />
        </div>
        <div>
          <field-label
            text="组织类型 Code"
            required
            hint="组织类型的唯一标识符，可用于获取组织类型信息"
          />
          <q-input
            v-model="orgTypeFormData.code"
            filled
            dense
            placeholder="请填写组织类型代码"
            hide-bottom-space
            :error="!!orgTypeFormError.code"
            :error-message="orgTypeFormError.code"
          />
        </div>
        <div>
          <field-label text="组织类型描述" />
          <q-input
            v-model="orgTypeFormData.description"
            filled
            dense
            type="textarea"
            placeholder="请填写组织类型描述"
            hide-bottom-space
          />
        </div>
        <div v-if="operatedOrgType.id">
          <q-toggle
            v-model="orgTypeFormData.is_deleted"
            label="是否标记为停用"
            :disable="operatedOrgType.is_protected"
          >
            <q-tooltip
              v-if="operatedOrgType.is_protected"
              anchor="bottom left"
              self="center start"
            >
              该组织类型为系统内置类型，您可以更名，但无法停用
            </q-tooltip>
          </q-toggle>
        </div>
      </div>
    </template>
  </form-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import { FormDialogComponent } from '../dialog/type';

import { OrgType, OrgTypePostData, OrgTypePostError } from './type';

export default defineComponent({
  name: 'OrgTypeForm',

  emits: ['orgTypeUpdated'],

  setup() {
    return {
      orgTypeForm: ref(false),
      orgTypeFormError: ref<OrgTypePostError>({}),
      orgTypeFormData: ref<OrgTypePostData>({}),
      operatedOrgType: ref<OrgType>({
        id: '',
        name: '',
      }),
    };
  },

  methods: {
    async show(orgType?: OrgType) {
      if (orgType) {
        const resp = await this.$api.get(`/org_types/${orgType.id}`);
        this.operatedOrgType = resp.data;
        this.orgTypeFormData = {
          name: resp.data.name,
          code: resp.data.code,
          description: resp.data.description,
          is_deleted: resp.data.is_deleted,
        };
      }
      this.orgTypeForm = true;
    },

    async saveOrgTypeForm() {
      try {
        this.orgTypeFormError = {};
        if (!this.operatedOrgType.id) {
          await this.$api.post('/org_types', this.orgTypeFormData, {
            successMsg: '组织类型创建成功',
          });
        } else {
          await this.$api.put(
            `/org_types/${this.operatedOrgType.id}`,
            this.orgTypeFormData,
            {
              successMsg: '组织类型更新成功',
            }
          );
        }
        (this.$refs.orgTypeDialog as FormDialogComponent).hide();
        this.$emit('orgTypeUpdated');
        this.resetOrgTypeForm();
      } catch (e) {
        this.orgTypeFormError = (e as Error).cause || {};
      }
    },

    resetOrgTypeForm() {
      this.orgTypeFormError = {};
      this.orgTypeFormData = {};
      this.operatedOrgType = {
        id: '',
        name: '',
      };
    },
  },
});
</script>

<style lang="scss" scoped></style>
