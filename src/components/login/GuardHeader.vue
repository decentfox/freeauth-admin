<template>
  <div class="row items-center q-pt-sm guard-header">
    <template v-if="ready">
      <q-img
        :src="loginSettings.guardLogo"
        spinner-color="white"
        class="q-mx-md img-wrapper"
        :class="{ 'bg-grey-2': !loginSettings.guardLogo }"
      />
      <div class="text-weight-bold text-h6 text-grey-10">
        {{ loginSettings.guardTitle || `自定义标题` }}
      </div>
    </template>
    <template v-else>
      <q-skeleton class="q-mx-md img-wrapper" />
      <q-item-section>
        <q-skeleton type="text" class="text-h6" />
      </q-item-section>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

import { loginSettingsStore } from 'stores/login-settings-store';

export default defineComponent({
  name: 'GuardHeader',

  computed: {
    ...mapState(loginSettingsStore, ['loginSettings', 'ready']),
  },
});
</script>

<style lang="scss" scoped>
.guard-header {
  .img-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 3px;
  }
}
</style>
