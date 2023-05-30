<template>
  <q-page class="full-width q-pa-md">
    <q-btn
      v-if="canGoBack"
      unelevated
      dense
      class="no-hover-btn hint-label"
      @click="goBack"
    >
      <q-icon size="18px" name="arrow_back_ios_new" />返回
    </q-btn>
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

    canGoBack: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    goBack() {
      this.$router.back();
    },
  },
});
</script>

<style lang="scss" scoped></style>
