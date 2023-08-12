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
    ref="dialog"
    title="密钥已生成"
    width="580px"
    hide-cancel
    hide-close
    ok-label="确定并关闭"
    :can-submit="confirmed"
    @confirm="hide"
  >
    <template #form-content>
      <div class="q-col-gutter-md q-pa-md">
        <div>
          <field-label text="AppID" />
          <q-input
            :model-value="appId"
            dense
            filled
            hide-bottom-space
            readonly
          />
        </div>
        <div>
          <field-label text="AppSecret" />
          <q-input
            :model-value="appSecret"
            dense
            filled
            hide-bottom-space
            readonly
          >
            <template #append>
              <q-btn
                dense
                flat
                class="q-pa-sm text-weight-bold text-body2 text-grey-8"
                label="复制"
                @click="$utils.copyToClipboard(appSecret)"
              />
            </template>
          </q-input>
        </div>
        <div>
          <q-checkbox v-model="confirmed" size="32px">
            <q-item-label>
              我已了解 AppSecret 不会明文存储在系统中，并且已复制保存好该
              AppSecret
            </q-item-label>
          </q-checkbox>
        </div>
      </div>
    </template>
  </form-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import { FormDialogComponent } from '../dialog/type';

export default defineComponent({
  name: 'AppSecretFormDialog',

  props: {
    /** 应用 ID */
    appId: {
      type: String,
      default: null,
    },
    /** 应用密钥 */
    appSecret: {
      type: String,
      default: null,
    },
  },

  setup() {
    return {
      confirmed: ref(false),
    };
  },

  methods: {
    show() {
      (this.$refs['dialog'] as FormDialogComponent).show();
    },

    hide() {
      (this.$refs['dialog'] as FormDialogComponent).hide();
    },
  },
});
</script>

<style lang="scss" scoped></style>
