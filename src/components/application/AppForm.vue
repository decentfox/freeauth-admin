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
  <!-- dialog form for creating -->
  <form-dialog
    v-if="action === FormAction.create"
    ref="appDialog"
    v-model="appFormDialog"
    title="创建应用"
    width="450px"
    @confirm="createApp"
    @close="resetAppForm"
  >
    <template #form-content>
      <app-form-content v-model="appFormData" :form-error="appFormError" />
    </template>
  </form-dialog>

  <!-- page form for updating -->
  <q-card v-if="action === FormAction.update" flat bordered class="q-pa-sm">
    <q-form>
      <app-form-content
        v-model="appFormData"
        :action="FormAction.update"
        :form-error="appFormError"
      />
      <q-card-actions class="q-px-md">
        <q-btn unelevated class="primary-btn" label="保存" @click="updateApp" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

import { FormDialogComponent } from '../dialog/type';
import { FormAction } from '../form/type';

import AppSecretFormDialog from './AppSecretFormDialog.vue';
import { Application, ApplicationPostData, ApplicationPostError } from './type';

export default defineComponent({
  name: 'AppForm',

  props: {
    /** 应用表单操作类型：创建或更新 */
    action: {
      type: String as PropType<FormAction>,
      default: FormAction.create,
    },
    /** 待更新的应用 */
    application: {
      type: Object as PropType<Application>,
      default: () => {
        return {};
      },
    },
  },

  emits: ['refresh'],

  setup() {
    return {
      FormAction,
      appFormDialog: ref(false),
      appFormData: ref<ApplicationPostData>({}),
      appFormError: ref<ApplicationPostError>({}),
      appPreviousData: ref<ApplicationPostData>({}),
    };
  },

  watch: {
    application() {
      this.appFormData = {
        name: this.application.name,
        description: this.application.description,
      };
      this.appPreviousData = Object.assign({}, this.appFormData);
    },
  },

  methods: {
    show() {
      this.appFormDialog = true;
    },

    async createApp() {
      try {
        this.appFormError = {};
        const resp = await this.$api.post('/applications', this.appFormData, {
          successMsg: '应用创建成功',
        });
        (this.$refs.appDialog as FormDialogComponent).hide();
        this.$emit('refresh');
        this.resetAppForm();
        const app = resp.data;
        this.$q.dialog({
          component: AppSecretFormDialog,
          componentProps: {
            appId: app.id,
            appSecret: app.secret,
          },
        });
      } catch (e) {
        this.appFormError = (e as Error).cause || {};
      }
    },

    async updateApp() {
      if (
        JSON.stringify(this.appPreviousData) ===
        JSON.stringify(this.appFormData)
      )
        return;
      try {
        this.appFormError = {};
        await this.$api.put(
          `/applications/${this.application.id}`,
          this.appFormData,
          {
            successMsg: '应用更新成功',
          }
        );
        this.$emit('refresh');
        this.appFormError = {};
      } catch (e) {
        this.appFormError = (e as Error).cause || {};
      }
    },

    resetAppForm() {
      this.appFormData = {};
      this.appFormError = {};
    },
  },
});
</script>

<style lang="scss" scoped></style>
