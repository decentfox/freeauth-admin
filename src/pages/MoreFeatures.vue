<template>
  <page-wrapper page-title="更多功能">
    <div class="q-pa-md row items-start q-gutter-md">
      <q-card class="my-card" bordered>
        <q-card-section horizontal>
          <q-card-section class="q-pt-xs">
            <div class="text-overline">Single Sign On</div>
            <div class="text-h6 q-mt-sm q-mb-xs">单点登录</div>
            <div class="text-caption text-grey">
              单点登录（SSO）是一种身份验证解决方案，可让用户通过一次性用户身份验证登录多个应用程序和网站。
            </div>
          </q-card-section>

          <q-card-section class="col-5 flex flex-center">
            <q-img class="rounded-borders" src="~assets/sso.png" />
          </q-card-section>
        </q-card-section>

        <q-separator />

        <q-card-actions>
          <q-btn flat round icon="pin_end" />
          <q-btn flat color="primary" @click="expanded = true"> 定制 </q-btn>
          <q-space />
          <q-item-label v-show="expanded" class="q-pr-sm">
            请致电 +86-15901259613
          </q-item-label>
        </q-card-actions>
      </q-card>

      <q-card class="my-card" bordered>
        <q-card-section horizontal>
          <q-card-section class="q-pt-xs">
            <div class="text-overline">Data Download</div>
            <div class="text-h6 q-mt-sm q-mb-xs">数据下载</div>
            <div class="text-caption text-grey">
              开启该功能，则可在各个表格页面，批量导出表格内全部或筛选过滤后的数据，导出文件为
              Excel。
            </div>
          </q-card-section>

          <q-card-section class="col-5 flex flex-center">
            <q-img class="rounded-borders" src="~assets/data.png" />
          </q-card-section>
        </q-card-section>

        <q-separator />

        <q-card-actions>
          <q-btn flat round icon="pin_end" />
          <q-btn flat color="primary" @click="expanded = true"> 定制 </q-btn>
          <q-space />
          <q-item-label v-show="expanded" class="q-pr-sm">
            请致电 +86-15901259613
          </q-item-label>
        </q-card-actions>
      </q-card>

      <q-card class="my-card" bordered>
        <q-card-section horizontal>
          <q-card-section class="q-pt-xs">
            <div class="text-overline">Batch Upload</div>
            <div class="text-h6 q-mt-sm q-mb-xs">数据导入</div>
            <div class="text-caption text-grey">
              开启该功能，可在部分管理界面中下载 Excel
              模板，填写后，则可通过上传该文件完成相应数据的批量导入。
            </div>
          </q-card-section>

          <q-card-section class="col-5 flex flex-center">
            <q-img class="rounded-borders" src="~assets/data.png" />
          </q-card-section>
        </q-card-section>

        <q-separator />

        <q-card-actions>
          <q-btn flat round icon="pin_end" />
          <q-btn flat color="primary" @click="expanded = true"> 定制 </q-btn>
          <q-space />
          <q-item-label v-show="expanded" class="q-pr-sm">
            请致电 +86-15901259613
          </q-item-label>
        </q-card-actions>
      </q-card>
    </div>
  </page-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'SingleSignOnSettings',

  setup() {
    return {
      expanded: ref(false),
    };
  },
});
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 350px
</style>
