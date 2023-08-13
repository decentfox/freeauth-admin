/*
  Copyright (c) 2016-present DecentFoX Studio and the FreeAuth authors.
  FreeAuth is licensed under Mulan PSL v2.
  You can use this software according to the terms and conditions of the Mulan PSL v2.
  You may obtain a copy of Mulan PSL v2 at:
           http://license.coscl.org.cn/MulanPSL2
  THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
  EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
  MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
  See the Mulan PSL v2 for more details.
*/
import { RouteRecordRaw } from 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    /** 路由权限配置 */
    requiredPerms?: string[];
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('pages/login/LoginPage.vue'),
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        path: '/login_settings',
        component: () => import('pages/login/LoginSettings.vue'),
        meta: {
          requiredPerms: ['manage:login_settings'],
        },
      },
      {
        path: '/user_admin_panel',
        component: () => import('pages/user/UserAdminPanel.vue'),
        meta: {
          requiredPerms: ['manage:users'],
          keepAlive: true,
        },
      },
      {
        path: '/user_profile/:userId/:tab?',
        component: () => import('pages/user/UserProfile.vue'),
        props: true,
        meta: {
          requiredPerms: ['manage:users'],
        },
      },
      {
        path: '/my_profile',
        component: () => import('pages/MyProfile.vue'),
      },
      {
        path: '/audit_logs',
        component: () => import('pages/AuditLogs.vue'),
        meta: {
          requiredPerms: ['manage:audit_logs'],
        },
      },
      {
        path: '/role_admin_panel',
        component: () => import('pages/role/RoleAdminPanel.vue'),
        meta: {
          requiredPerms: ['manage:roles'],
          keepAlive: true,
        },
      },
      {
        path: '/role_profile/:roleId/:tab?',
        component: () => import('pages/role/RoleProfile.vue'),
        props: true,
        meta: {
          requiredPerms: ['manage:roles'],
        },
      },
      {
        path: '/perm_admin_panel',
        component: () => import('pages/permission/PermAdminPanel.vue'),
        meta: {
          requiredPerms: ['manage:perms'],
          keepAlive: true,
        },
      },
      {
        path: '/perm_profile/:permId',
        component: () => import('pages/permission/PermProfile.vue'),
        props: true,
        meta: {
          requiredPerms: ['manage:perms'],
        },
      },
      {
        path: '/org_admin_panel',
        component: () => import('pages/OrgAdminPanel.vue'),
        meta: {
          requiredPerms: ['manage:orgs'],
        },
      },
      {
        path: '/app_admin_panel',
        component: () => import('pages/application/AppAdminIndex.vue'),
        meta: {
          requiredPerms: ['manage:apps'],
          keepAlive: true,
        },
      },
      {
        path: '/app_profile/:appId',
        component: () => import('pages/application/AppProfile.vue'),
        props: true,
        meta: {
          requiredPerms: ['manage:apps'],
        },
      },
      {
        path: '/more',
        component: () => import('pages/MoreFeatures.vue'),
      },
    ],
  },

  // Please always leave this as the last one,
  // but you can also remove it if needed.
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
