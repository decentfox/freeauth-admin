<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> Quasar App </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-grey-2 text-grey-9 text-weight-bold"
      :width="220"
      :breakpoint="400"
    >
      <q-scroll-area class="fit">
        <q-list class="q-py-lg">
          <q-expansion-item
            v-for="(section, idx) in essentialLinks"
            :key="idx"
            :content-inset-level="0"
            expand-separator
            :icon="section.icon"
            :label="section.header"
            group="somegroup"
            expand-icon="arrow_drop_down"
          >
            <EssentialLink
              v-for="(link, lIdx) in section.links"
              :key="lIdx"
              v-bind="link"
              class="text-weight-regular essential-link"
            />
          </q-expansion-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import EssentialLink from 'components/EssentialLink.vue';

import { MainMenu } from '../type';

const linksList: MainMenu[] = [
  {
    header: 'Demo',
    icon: 'account_tree',
    links: [
      {
        title: '组织管理',
        link: '/orgs_demo',
      },
      {
        title: '角色管理',
        link: '/roles_demo',
      },
      {
        title: '用户管理',
        link: '/users_demo',
      },
      {
        title: '权限设置',
      },
    ],
  },
];

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink,
  },

  setup() {
    const leftDrawerOpen = ref(false);

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>

<style lang="scss" scoped>
.essential-link {
  padding-left: 72px;
}
</style>
