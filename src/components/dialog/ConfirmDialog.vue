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
  <q-dialog ref="dialog" persistent @hide="onDialogHide">
    <q-card :style="`width: ${width}`" class="q-pa-md">
      <q-item>
        <q-item-section avatar class="q-pr-sm">
          <q-icon name="announcement" color="accent" />
        </q-item-section>
        <q-item-section class="q-py-sm">
          <q-item-label class="text-weight-bold text-subtitle1">
            {{ title }}
          </q-item-label>
        </q-item-section>
        <q-space />
      </q-item>
      <q-card-section class="q-pt-sm q-pb-md">
        <!-- eslint-disable vue/no-v-html -->
        <div v-html="content" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          v-for="button in buttons"
          :key="button.label"
          v-bind="button"
          v-close-popup
          unelevated
          :class="button.class"
          @click="onClick(button)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { QDialog } from 'quasar';

import { DialogButton } from './type';

export default defineComponent({
  name: 'ConfirmDialog',

  props: {
    title: {
      type: String,
      default: '弹窗',
    },
    width: {
      type: String,
      default: '400px',
    },
    content: {
      type: String,
      default: '描述',
    },
    buttons: {
      type: Array as PropType<DialogButton[]>,
      default: () => {
        return [];
      },
    },
  },

  emits: ['ok', 'hide'],

  methods: {
    show() {
      (this.$refs['dialog'] as QDialog).show();
    },

    hide() {
      (this.$refs['dialog'] as QDialog).hide();
    },

    onDialogHide() {
      this.$emit('hide');
    },

    onClick(button: DialogButton) {
      this.$emit('ok', { type: button.actionType });
      this.hide();
    },
  },
});
</script>

<style lang="scss" scoped></style>
