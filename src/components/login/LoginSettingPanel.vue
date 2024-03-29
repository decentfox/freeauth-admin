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
  <q-expansion-item
    v-model="model"
    group="loginSettingPanel"
    :icon="icon"
    :label="title"
    hide-expand-icon
    header-class="text-black-white text-weight-bold text-body1"
    @update:model-value="onValueUpdated"
  >
    <q-separator />
    <q-card class="q-pa-md">
      <q-form>
        <slot />
        <q-card-actions>
          <q-btn
            unelevated
            class="primary-btn q-mx-sm"
            label="保存"
            @click="saveSettings()"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-expansion-item>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { mapActions } from 'pinia';

import { loginSettingsStore } from 'stores/login-settings-store';

export default defineComponent({
  name: 'LoginSettingPanel',

  props: {
    /** 配置面板标题 */
    title: {
      type: String,
      default: null,
    },
    /** 配置面板图标 */
    icon: {
      type: String,
      default: null,
      required: true,
    },
    /** 是否展开面板 */
    modelValue: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:modelValue'],

  setup() {
    return {
      model: ref<boolean>(false),
    };
  },

  watch: {
    modelValue(val: boolean) {
      this.model = val;
    },
  },

  created() {
    this.model = this.modelValue;
  },

  methods: {
    ...mapActions(loginSettingsStore, ['saveSettings']),

    onValueUpdated(val: boolean) {
      this.$emit('update:modelValue', val);
    },
  },
});
</script>

<style lang="scss" scoped></style>
