<template>
  <form-dialog v-model="baseForm" title="创建权限" width="450px">
    <template #form-content> </template>
  </form-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'CreatePermForm',

  setup() {
    return {
      baseForm: ref(false),
    };
  },

  methods: {
    show() {
      this.baseForm = true;
    },
  },
});
</script>

<style lang="scss" scoped></style>
