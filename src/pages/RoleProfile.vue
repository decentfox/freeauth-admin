<template>
  <q-page class="full-width">
    <q-item-label header>角色详情页（{{ roleId }}）</q-item-label>
    <q-btn @click="goBack">back</q-btn>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'RoleProfile',

  components: {},

  props: {
    roleId: {
      type: String,
      default: null,
    },
  },

  setup() {
    return {};
  },

  methods: {
    goBack() {
      this.$router.back();
    },
  },
});
</script>
