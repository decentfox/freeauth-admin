<template>
  <q-btn flat dense :class="btnClass" :style="btnStyle">
    <q-icon v-if="btnIcon" size="18px" :name="btnIcon" />{{ btnLabel }}
    <q-menu class="q-px-xs" anchor="bottom right" self="top right">
      <q-list dense>
        <q-item
          v-for="button in buttons"
          :key="button.label"
          v-close-popup
          v-bind="button"
          clickable
          class="q-my-xs"
          :disable="button.disable"
          @click="onClick(button)"
        >
          <q-item-section v-if="button.icon" avatar class="q-pr-none">
            <q-icon :name="button.icon" size="16px" />
          </q-item-section>
          <q-item-section> {{ button.label }} </q-item-section>
          <q-tooltip
            v-if="button.disable"
            anchor="bottom left"
            self="center start"
          >
            {{ button.disableHint }}
          </q-tooltip>
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
    btnIcon: {
      type: String,
      default: 'more_horiz',
    },
    btnLabel: {
      type: String,
      default: '',
    },
    btnClass: {
      type: String,
      default: 'text-black-white',
    },
    btnStyle: {
      type: String,
      default: '',
    },
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
