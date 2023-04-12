<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated class="main-header">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          class="flat-btn"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title>
          <a href="/">
            <img
              v-if="$q.dark.isActive"
              class="q-mt-sm"
              src="~assets/logo-dark.png"
              alt="logo"
              width="120"
            />
            <img
              v-else
              class="q-mt-sm"
              src="~assets/logo.png"
              alt="logo"
              width="120"
            />
          </a>
        </q-toolbar-title>

        <div class="q-pl-md q-gutter-xs row no-wrap items-center">
          <q-btn flat label="帮助文档" class="flat-btn" />
          <q-btn round flat class="flat-btn">
            <q-avatar size="26px">
              <q-icon name="admin_panel_settings" />
            </q-avatar>
            <q-tooltip>Account</q-tooltip>
          </q-btn>
          <q-btn
            round
            flat
            class="flat-btn"
            @click="$q.dark.isActive ? $q.dark.set(false) : $q.dark.set(true)"
          >
            <q-avatar size="26px">
              <q-icon :name="$q.dark.isActive ? 'sunny' : 'dark_mode'" />
            </q-avatar>
            <q-tooltip>{{ $q.dark.isActive ? 'Light' : 'Dark' }}</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="200"
      :breakpoint="400"
    >
      <q-scroll-area class="fit">
        <q-list class="q-py-lg main-menu">
          <div v-for="(group, idx) in mainMenu" :key="idx">
            <q-item
              v-for="(item, itemIdx) in group.links"
              :key="itemIdx"
              v-ripple
              :to="item.link"
              clickable
              :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-9'"
              active-class="active-link"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" size="xs" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ item.title }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator
              v-if="idx !== mainMenu.length - 1"
              inset
              class="q-my-sm"
            />
          </div>
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

import { MainMenuSection } from 'components/type';

const menuLinkList: MainMenuSection[] = [
  {
    header: '业务范围',
    links: [
      {
        title: '组织管理',
        icon: 'account_tree',
        link: '/org_admin_panel',
      },
      {
        title: '角色管理',
        icon: 'people_alt',
      },
      {
        title: '用户管理',
        icon: 'contacts',
        link: '/user_admin_panel',
      },
      {
        title: '应用管理',
        icon: 'apps',
      },
      {
        title: '权限设置',
        icon: 'room_preferences',
      },
    ],
  },
  {
    header: '技术范围',
    links: [
      {
        title: '登录配置',
        icon: 'password',
      },
      {
        title: '安全设置',
        icon: 'add_moderator',
      },
      {
        title: '审计日志',
        icon: 'mark_chat_read',
      },
    ],
  },
];

export default defineComponent({
  name: 'MainLayout',

  components: {},

  setup() {
    const leftDrawerOpen = ref(false);

    return {
      mainMenu: menuLinkList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>

<style lang="scss" scoped>
.active-link {
  background: $primary;
  color: white !important;

  .q-icon {
    color: white !important;
  }
}
</style>
