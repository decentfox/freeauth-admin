import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
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
        path: '/user_admin_panel',
        component: () => import('pages/UserAdminPanel.vue'),
      },
      {
        path: '/user_profile/:userId',
        component: () => import('pages/UserProfile.vue'),
        props: true,
      },
      {
        path: '/audit_logs',
        component: () => import('pages/AuditLogs.vue'),
      },
      {
        path: '/role_admin_panel',
        component: () => import('pages/RoleAdminPanel.vue'),
      },
      {
        path: '/perm_admin_panel',
        component: () => import('pages/PermAdminPanel.vue'),
      },
      {
        path: '/org_admin_panel',
        component: () => import('pages/OrgAdminPanel.vue'),
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
