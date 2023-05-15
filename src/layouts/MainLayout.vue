<template>
  <q-layout v-if="authenticated" view="hHh Lpr lFf">
    <q-header elevated class="main-header">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          class="text-black-white"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title>
          <a href="/">
            <img
              v-if="$q.dark.isActive"
              class="q-mt-sm"
              src="~assets/logo-dark.png"
              alt="logo"
              width="110"
            />
            <img
              v-else
              class="q-mt-sm"
              src="~assets/logo.png"
              alt="logo"
              width="110"
            />
          </a>
        </q-toolbar-title>

        <div class="q-pl-md q-gutter-xs row no-wrap items-center">
          <q-btn flat label="帮助文档" class="text-black-white" />
          <q-btn round flat class="text-black-white">
            <q-avatar size="26px">
              <q-icon name="admin_panel_settings" />
            </q-avatar>
            <q-tooltip>账号</q-tooltip>
          </q-btn>
          <q-btn
            round
            flat
            class="text-black-white"
            @click="$q.dark.isActive ? $q.dark.set(false) : $q.dark.set(true)"
          >
            <q-avatar size="26px">
              <q-icon :name="$q.dark.isActive ? 'sunny' : 'dark_mode'" />
            </q-avatar>
            <q-tooltip>
              {{ $q.dark.isActive ? '浅色模式' : '深色模式' }}
            </q-tooltip>
          </q-btn>
          <q-btn round flat class="text-black-white" @click="onSignOut">
            <!-- TODO: render signOut button (leave it to 小🐻) -->
            <q-avatar size="26px">
              <q-icon name="admin_panel_settings" />
            </q-avatar>
            <q-tooltip>退出登录</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="185"
      :breakpoint="400"
    >
      <q-scroll-area class="fit">
        <q-list class="q-pr-sm main-menu">
          <div v-for="(group, idx) in mainMenu" :key="idx">
            <q-item-label
              class="q-pl-lg q-pt-lg q-pb-sm text-overline"
              style="font-size: 11px"
            >
              {{ group.header }}
            </q-item-label>
            <q-separator inset />
            <q-item
              v-for="(item, itemIdx) in group.links"
              :key="itemIdx"
              v-ripple
              dense
              :to="item.link"
              clickable
              class="q-my-md"
              :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-9'"
              active-class="active-link"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" size="xs" class="q-ml-sm" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ item.title }}</q-item-label>
              </q-item-section>
            </q-item>
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
import { mapActions, mapState } from 'pinia';

import { MainMenuSection } from 'components/type';
import { authStore } from 'stores/auth-store';

const menuLinkList: MainMenuSection[] = [
  {
    header: 'F2P · 基础功能',
    links: [
      {
        title: '定制登录',
        icon: 'password',
        link: '/login_settings',
      },
      {
        title: '用户管理',
        icon: 'contacts',
        link: '/user_admin_panel',
      },
      {
        title: '审计日志',
        icon: 'mark_chat_read',
        link: '/audit_logs',
      },
      {
        title: '参数设置',
        icon: 'settings_suggest',
        link: '/common_settings',
      },
    ],
  },
  {
    header: 'PRO · 高级功能',
    links: [
      {
        title: '组织管理',
        icon: 'account_tree',
        link: '/org_admin_panel',
      },
      {
        title: '角色管理',
        icon: 'people_alt',
        link: '/role_admin_panel',
      },
      {
        title: '权限管理',
        icon: 'room_preferences',
        link: '/perm_admin_panel',
      },
    ],
  },
  {
    header: 'ECO · 生态功能',
    links: [
      {
        title: '应用管理',
        icon: 'apps',
      },
      {
        title: '单点登录',
        icon: 'pin_end',
      },
    ],
  },
];

export default defineComponent({
  name: 'MainLayout',

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

  computed: {
    ...mapState(authStore, ['authenticated']),
  },

  async created() {
    try {
      await this.fetchProfile();
    } catch (e) {}
  },

  methods: {
    ...mapActions(authStore, ['fetchProfile', 'signOut']),

    async onSignOut() {
      await this.signOut();
      this.$router.replace('/login');
    },
  },
});
</script>

<style lang="scss" scoped>
.main-menu {
  .q-item {
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
  }

  .active-link {
    background: $primary;
    color: white !important;

    .q-icon {
      color: white !important;
    }
  }
}
</style>
