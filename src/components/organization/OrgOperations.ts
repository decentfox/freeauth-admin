import { api } from 'boot/axios';
import { Dialog } from 'quasar';

import ConfirmDialog from '../dialog/ConfirmDialog.vue';

import { Organization, OrgOperationsType, OrgType } from './type';

export const OrgOperationsMixin: OrgOperationsType = {
  methods: {
    deleteOrgType(orgType: OrgType, handler?: (...args: [string]) => void) {
      const orgName = orgType.name;
      Dialog.create({
        component: ConfirmDialog,
        componentProps: {
          title: '删除组织类型',
          content: `操作后，该组织类型【${orgName}】下的所有企业将一并执行删除；与这些企业相关联的用户将自动与企业解绑，但仍可继续正常使用。请问您确认要执行删除吗？`,
          buttons: [
            { label: '取消', class: 'secondary-btn' },
            {
              label: '删除',
              actionType: 'delete',
              class: 'accent-btn',
            },
          ],
        },
      }).onOk(async ({ type }) => {
        if (type === 'delete') {
          try {
            await api.request({
              method: 'DELETE',
              url: '/org_types',
              data: { ids: [orgType.id] },
              successMsg: '组织类型删除成功',
            });
          } finally {
            if (handler) {
              handler('delete_org_type');
            }
          }
        }
      });
    },

    deleteOrganization(
      org: Organization,
      handler?: (...args: [string]) => void
    ) {
      const orgId = org.id;
      const orgName = org.name;
      Dialog.create({
        component: ConfirmDialog,
        componentProps: {
          title: org.is_enterprise ? '删除企业' : '删除部门',
          content: `操作后，【${orgName}】的下属部门将一并执行删除；与其关联的用户将自动解绑，但仍可继续正常使用。请问您确认要执行删除吗？`,
          buttons: [
            { label: '取消', class: 'secondary-btn' },
            {
              label: '删除',
              actionType: 'delete',
              class: 'accent-btn',
            },
          ],
        },
      }).onOk(async ({ type }) => {
        if (type === 'delete') {
          try {
            await api.request({
              method: 'DELETE',
              url: '/organizations',
              data: { ids: [orgId] },
              successMsg: org.is_enterprise ? '企业删除成功' : '部门删除成功',
            });
          } finally {
            if (handler) {
              handler('delete_org');
            }
          }
        }
      });
    },
  },
};
