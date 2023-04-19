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
        ></q-btn>
      </q-item>
      <q-separator />
      <q-card-section class="q-pa-sm">
        <q-form ref="form" greedy>
          <slot name="form-content"></slot>
        </q-form>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn v-if="!hideCancel" v-close-popup flat label="取消" />
        <q-btn unelevated :label="okLabel" class="primary-btn" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { QDialog, QForm } from 'quasar';

export default defineComponent({
  name: 'FormDialog',

  props: {
    title: {
      type: String,
      default: '弹窗',
    },
    width: {
      type: String,
      default: '500px',
    },
    okLabel: {
      type: String,
      default: '保存',
    },
    hideCancel: {
      type: Boolean,
      default: false,
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
