<template>
  <page-wrapper page-title="应用管理">
    <div
      class="text-center q-pa-md flex flex-center"
      style="height: calc(100vh - 200px)"
    >
      <div>
        <div class="text-grey-9 q-mb-lg" style="font-size: 8vh">敬请期待</div>
        <q-btn flat class="primary-btn" to="/more" label="查看更多" />
      </div>
    </div>
  </page-wrapper>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppAdminIndex',
});
</script>
