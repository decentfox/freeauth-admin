<template>
  <q-btn size="12px" flat dense icon="more_horiz" class="text-black-white">
    <q-menu class="q-px-xs">
      <q-list dense>
        <q-item
          v-for="button in buttons"
          :key="button.label"
          v-close-popup
          v-bind="button"
          clickable
          class="q-my-xs"
          @click="onClick(button)"
        >
          <q-item-section avatar class="q-pr-none">
            <q-icon :name="button.icon" size="16px" />
          </q-item-section>
          <q-item-section> {{ button.label }} </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { MenuButton } from './type';

export default defineComponent({
  name: 'DropdownButton',

  props: {
    buttons: {
      type: Array as PropType<MenuButton[]>,
      default: () => {
        return [];
      },
    },
  },

  emits: ['menuClick'],

  methods: {
    onClick(button: MenuButton) {
      this.$emit('menuClick', { type: button.actionType });
    },
  },
});
</script>

<style lang="scss" scoped></style>
