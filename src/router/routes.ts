import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
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
        component: () => import('pages/LoginSettings.vue'),
      },
      {
        path: '/common_settings',
        component: () => import('pages/CommonSettings.vue'),
      },
      {
        path: '/user_admin_panel',
        component: () => import('pages/user/UserAdminPanel.vue'),
      },
      {
        path: '/user_profile/:userId/:tab?',
        component: () => import('pages/user/UserProfile.vue'),
        props: true,
      },
      {
        path: '/audit_logs',
        component: () => import('pages/AuditLogs.vue'),
      },
      {
        path: '/role_admin_panel',
        component: () => import('pages/role/RoleAdminPanel.vue'),
      },
      {
        path: '/role_profile/:roleId/:tab?',
        component: () => import('pages/role/RoleProfile.vue'),
        props: true,
      },
      {
        path: '/perm_admin_panel',
        component: () => import('pages/permission/PermAdminPanel.vue'),
      },
      {
        path: '/perm_profile/:permId',
        component: () => import('pages/permission/PermProfile.vue'),
        props: true,
      },
      {
        path: '/org_admin_panel',
        component: () => import('pages/OrgAdminPanel.vue'),
      },
      {
        path: '/app_admin_panel',
        component: () => import('pages/AppAdminPanel.vue'),
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
