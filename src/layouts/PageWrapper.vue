<template>
  <q-page class="full-width q-pa-md">
    <q-btn
      v-if="!!pageTitle"
      unelevated
      dense
      class="no-hover-btn hint-label"
      @click="$router.go(0)"
    >
      <q-icon size="18px" class="q-pr-xs" name="subject" />{{ pageTitle }}
    </q-btn>
    <slot />
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PageWrapper',

  props: {
    pageTitle: {
      type: String,
      default: '',
    },
  },
});
</script>

<style lang="scss" scoped></style>
