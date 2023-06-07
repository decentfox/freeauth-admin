<template>
  <form-dialog
    ref="dialog"
    title="密钥已生成"
    width="580px"
    hide-cancel
    ok-label="确定并关闭"
    :can-submit="confirmed"
    @confirm="hide"
  >
    <template #form-content>
      <div class="q-col-gutter-md q-pa-md">
        <div class="row items-center">
          <field-label text="AppID" class="col-2" />
          <q-input
            :model-value="appId"
            dense
            filled
            hide-bottom-space
            bg-color="grey-2"
            readonly
            class="col"
          />
        </div>
        <div class="row items-center">
          <field-label text="AppSecret" class="col-2" />
          <q-input
            :model-value="appSecret"
            dense
            filled
            hide-bottom-space
            bg-color="grey-2"
            readonly
            class="col"
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
        <q-checkbox v-model="confirmed" size="32px">
          <q-item-label>
            我已了解 AppSecret 不会明文存储在系统中，并且已复制保存好该
            AppSecret
          </q-item-label>
        </q-checkbox>
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
