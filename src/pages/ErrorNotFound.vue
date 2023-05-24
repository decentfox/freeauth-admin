<template>
  <div class="fullscreen text-center q-pa-md flex flex-center">
    <div>
      <div class="text-grey-9" style="font-size: 20vh">404</div>
      <div class="text-h3 text-grey-9 q-mb-xl">Oops. Nothing here...</div>
      <q-btn unelevated class="primary-btn" to="/" label="Go Home" no-caps />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ErrorNotFound',
});
</script>
