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
        path: '/common_settings',
        component: () => import('pages/CommonSettings.vue'),
      },
      {
        path: '/user_admin_panel',
        component: () => import('pages/user/UserAdminPanel.vue'),
        meta: {
          requiredPerms: ['manage:users'],
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
        component: () => import('pages/AppAdminPanel.vue'),
        meta: {
          requiredPerms: ['manage:apps'],
        },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
