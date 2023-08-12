<!--
  Copyright (c) 2016-present DecentFoX Studio and the FreeAuth authors.
  FreeAuth is licensed under Mulan PSL v2.
  You can use this software according to the terms and conditions of the Mulan PSL v2.
  You may obtain a copy of Mulan PSL v2 at:
           http://license.coscl.org.cn/MulanPSL2
  THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
  EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
  MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
  See the Mulan PSL v2 for more details.
-->
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
          <q-btn
            rounded
            flat
            dense
            label="帮助文档"
            class="text-black-white q-px-sm"
          />
          <q-btn
            round
            flat
            dense
            class="text-black-white"
            @click="$q.dark.isActive ? $q.dark.set(false) : $q.dark.set(true)"
          >
            <q-icon
              size="24px"
              :name="$q.dark.isActive ? 'sunny' : 'dark_mode'"
            />
            <q-tooltip>
              {{ $q.dark.isActive ? '浅色模式' : '深色模式' }}
            </q-tooltip>
          </q-btn>
          <dropdown-button
            rounded
            btn-icon="account_circle"
            btn-class="q-px-sm text-black-white"
            :btn-label="currentUser.username"
            :buttons="[
              {
                label: '个人信息',
                icon: 'portrait',
                actionType: 'profile',
              },
              {
                label: '退出登录',
                icon: 'exit_to_app',
                actionType: 'logout',
              },
            ]"
            @profile="goToProfile"
            @logout="onSignOut"
          />
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
              @click="goToPage(item)"
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
      <router-view v-slot="{ Component, route }">
        <keep-alive>
          <component
            :is="Component"
            v-if="route.meta.keepAlive"
            :key="route.fullPath"
          />
        </keep-alive>
        <component
          :is="Component"
          v-if="!route.meta.keepAlive"
          :key="route.fullPath"
        />
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { mapActions, mapState, mapWritableState } from 'pinia';

import { MainMenuLink, MainMenuSection } from 'components/common/type';
import { appStore } from 'stores/app-store';
import { authStore } from 'stores/auth-store';

const menuLinkList: MainMenuSection[] = [
  {
    header: 'F2P · 基础功能',
    links: [
      {
        title: '定制登录',
        icon: 'password',
        link: '/login_settings',
        requiredPerms: ['manage:login_settings'],
      },
      {
        title: '用户管理',
        icon: 'contacts',
        link: '/user_admin_panel',
        requiredPerms: ['manage:users'],
      },
      {
        title: '审计日志',
        icon: 'mark_chat_read',
        link: '/audit_logs',
        requiredPerms: ['manage:audit_logs'],
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
        requiredPerms: ['manage:orgs'],
      },
      {
        title: '角色管理',
        icon: 'people_alt',
        link: '/role_admin_panel',
        requiredPerms: ['manage:roles'],
      },
      {
        title: '权限管理',
        icon: 'room_preferences',
        link: '/perm_admin_panel',
        requiredPerms: ['manage:perms'],
      },
    ],
  },
  {
    header: 'ECO · 生态功能',
    links: [
      {
        title: '应用管理',
        icon: 'apps',
        link: '/app_admin_panel',
        requiredPerms: ['manage:apps'],
      },
      {
        title: '更多功能',
        icon: 'pin_end',
        link: '/more',
      },
    ],
  },
];

export default defineComponent({
  name: 'MainLayout',

  setup() {
    const leftDrawerOpen = ref(false);

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },

  computed: {
    ...mapState(authStore, ['authenticated', 'currentUser']),
    ...mapWritableState(appStore, ['keepAliveDisabled']),

    mainMenu() {
      return menuLinkList
        .map((list) => {
          return Object.assign({}, list, {
            links: list.links.filter(
              (link) =>
                !link.requiredPerms || this.hasAnyPermission(link.requiredPerms)
            ),
          });
        })
        .filter((list) => list.links.length > 0);
    },
  },

  async created() {
    try {
      await this.fetchProfile();
    } catch (e) {}
  },

  methods: {
    ...mapActions(authStore, ['fetchProfile', 'signOut', 'hasAnyPermission']),

    async onSignOut() {
      await this.signOut();
      this.$router.replace('/login');
    },

    goToPage(menu: MainMenuLink) {
      this.keepAliveDisabled = true;
      if (menu.link) {
        this.$router.push(menu.link);
      }
    },

    goToProfile() {
      this.$router.push('/my_profile');
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
