<template>
  <q-dialog ref="dialog" persistent @hide="onDialogHide">
    <q-card :style="`width: ${width}; max-width: 800px`">
      <q-item>
        <q-item-section class="q-pa-sm">
          <q-item-label class="text-weight-bold text-subtitle1">
            {{ title }}
          </q-item-label>
        </q-item-section>
        <q-space />
        <q-btn
          v-close-popup
          dense
          flat
          no-hover
          size="sm"
          icon="close"
          class="no-hover-btn"
        />
      </q-item>
      <q-separator />
      <q-form ref="form" greedy @submit.prevent="save">
        <q-card-section class="q-pa-sm">
          <slot name="form-content"></slot>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn
            v-if="!hideCancel"
            v-close-popup
            flat
            label="取消"
            class="text-black-white"
          />
          <q-btn
            unelevated
            :label="okLabel"
            :disable="!canSubmit"
            type="submit"
            class="primary-btn"
          >
          </q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { QDialog, QForm } from 'quasar';

export default defineComponent({
  name: 'FormDialog',

  props: {
    /** 表单弹窗标题 */
    title: {
      type: String,
      default: '弹窗',
    },
    /** 表单弹窗宽度 */
    width: {
      type: String,
      default: '500px',
    },
    /** 表单提交按钮文字 */
    okLabel: {
      type: String,
      default: '保存',
    },
    /** 表单弹窗是否隐藏取消按钮 */
    hideCancel: {
      type: Boolean,
      default: false,
    },
    /** 表单提交按钮是否可以点击 */
    canSubmit: {
      type: Boolean,
      default: true,
    },
  },

  emits: ['confirm', 'close'],

  methods: {
    save() {
      (this.$refs['form'] as QForm).validate().then((success: boolean) => {
        if (success) {
          this.$emit('confirm');
        }
      });
    },

    show() {
      (this.$refs['dialog'] as QDialog).show();
    },

    hide() {
      (this.$refs['dialog'] as QDialog).hide();
    },

    onDialogHide() {
      this.$emit('close');
    },
  },
});
</script>

<style lang="scss" scoped></style>
