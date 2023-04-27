<template>
  <q-page class="full-width">
    <q-item-label header>用户详情页（{{ userId }}）</q-item-label>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'UserProfile',

  components: {},

  props: {
    userId: {
      type: String,
      default: null,
    },
  },

  setup() {
    return {};
  },
});
</script>
