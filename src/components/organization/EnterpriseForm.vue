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
    ref="enterpriseDialog"
    v-model="enterpriseForm"
    title="企业机构"
    width="450px"
    @confirm="saveEnterpriseForm"
    @close="resetEnterpriseForm"
  >
    <template #form-content>
      <div class="q-gutter-md q-pa-md">
        <div>
          <field-label text="企业机构名称" required />
          <q-input
            v-model="enterpriseFormData.name"
            filled
            dense
            placeholder="请填写企业名称"
            hide-bottom-space
            :error="!!enterpriseFormError.name"
            :error-message="enterpriseFormError.name"
          />
        </div>
        <div>
          <field-label
            text="企业机构 Code"
            hint="企业机构的唯一标识符，同一组织类型下唯一，可用于获取企业信息"
          />
          <q-input
            v-model="enterpriseFormData.code"
            filled
            dense
            placeholder="请填写企业代码"
            hide-bottom-space
            :error="!!enterpriseFormError.code"
            :error-message="enterpriseFormError.code"
          />
        </div>
        <div>
          <field-label text="企业税务信息" />
          <q-input
            v-model="enterpriseFormData.tax_id"
            filled
            dense
            placeholder="请填写 15、18 或 20 位纳税识别号"
            hide-bottom-space
            :error="!!enterpriseFormError.tax_id"
            :error-message="enterpriseFormError.tax_id"
          />
        </div>

        <div>
          <field-label text="企业银行信息" />
          <div class="q-gutter-sm">
            <q-input
              v-model="enterpriseFormData.issuing_bank"
              filled
              dense
              placeholder="请填写开户行名称"
              hide-bottom-space
              class="col"
            />
            <q-input
              v-model="enterpriseFormData.bank_account_number"
              filled
              dense
              placeholder="请填写银行账号"
              hide-bottom-space
              class="col"
            />
          </div>
        </div>

        <div>
          <field-label text="企业办公信息" />
          <div class="q-gutter-sm">
            <q-input
              v-model="enterpriseFormData.contact_address"
              filled
              dense
              placeholder="请填写办公地址"
              hide-bottom-space
              class="col"
            />
            <q-input
              v-model="enterpriseFormData.contact_phone_num"
              filled
              dense
              placeholder="请填写办公电话"
              hide-bottom-space
              class="col"
            />
          </div>
        </div>
      </div>
    </template>
  </form-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import { FormDialogComponent } from '../dialog/type';

import { Enterprise, EnterprisePostData, EnterprisePostError } from './type';

export default defineComponent({
  name: 'OrgTypeForm',

  props: {
    /** 当前操作所在组织类型 */
    selectedOrgTypeId: {
      type: String,
      default: '',
    },
  },

  emits: ['enterpriseUpdated'],

  setup() {
    return {
      enterpriseForm: ref(false),
      enterpriseFormError: ref<EnterprisePostError>({}),
      enterpriseFormData: ref<EnterprisePostData>({}),
      operatedEnterprise: ref<Enterprise>({
        id: '',
        name: '',
      }),
    };
  },

  methods: {
    async show(enterpriseId?: string) {
      if (enterpriseId) {
        const resp = await this.$api.get(`/enterprises/${enterpriseId}`);
        this.operatedEnterprise = resp.data;
        this.enterpriseFormData = {
          name: resp.data.name,
          code: resp.data.code,
          tax_id: resp.data.tax_id,
          issuing_bank: resp.data.issuing_bank,
          bank_account_number: resp.data.bank_account_number,
          contact_address: resp.data.contact_address,
          contact_phone_num: resp.data.contact_phone_num,
        };
      }
      this.enterpriseForm = true;
    },

    async saveEnterpriseForm() {
      try {
        this.enterpriseFormError = {};
        this.enterpriseFormData.org_type_id = this.selectedOrgTypeId;
        if (!this.operatedEnterprise.id) {
          await this.$api.post('/enterprises', this.enterpriseFormData, {
            successMsg: '企业机构创建成功',
          });
        } else {
          await this.$api.put(
            `/enterprises/${this.operatedEnterprise.id}`,
            this.enterpriseFormData,
            {
              successMsg: '企业机构更新成功',
            }
          );
        }
        (this.$refs.enterpriseDialog as FormDialogComponent).hide();
        this.$emit('enterpriseUpdated');
        this.resetEnterpriseForm();
      } catch (e) {
        this.enterpriseFormError = (e as Error).cause || {};
      }
    },

    resetEnterpriseForm() {
      this.enterpriseFormError = {};
      this.enterpriseFormData = {};
      this.operatedEnterprise = {
        id: '',
        name: '',
      };
    },
  },
});
</script>

<style lang="scss" scoped></style>
