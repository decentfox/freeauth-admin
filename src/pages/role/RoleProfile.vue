<template>
  <profile-page
    ref="profile"
    v-model:tab-value="panelTab"
    :name="role.name"
    :status="!role.is_deleted"
    :tabs="[
      { name: 'role', label: '基本信息' },
      { name: 'users', label: '关联主体' },
      { name: 'perms', label: '配置权限' },
    ]"
    @update:tab-value="switchPanelTab"
  >
    <template #toolbar-right>
      <dropdown-button
        btn-label="更多操作"
        btn-icon="expand_more"
        btn-class="q-px-md secondary-btn"
        :buttons="[
          {
            label: !role.is_deleted ? '禁用角色' : '启用角色',
            icon: !role.is_deleted ? 'remove_circle_outline' : 'task_alt',
            actionType: !role.is_deleted ? 'disable' : 'enable',
          },

          {
            label: '删除角色',
            icon: 'delete_outline',
            actionType: 'delete',
          },
        ]"
        @disable="toggleRolesStatus([role], true, refreshRoleData)"
        @enable="toggleRolesStatus([role], false, refreshRoleData)"
        @delete="deleteRoles([role], refreshRoleData)"
      />
    </template>
    <template #panels>
      <q-tab-panel name="role">
        <role-form
          ref="updateRoleForm"
          :role="role"
          :action="FormAction.update"
          @refresh="loadRoleInfo"
        />
      </q-tab-panel>
      <q-tab-panel name="users">
        <data-table
          ref="userTable"
          :columns="userColumns"
          sticky-action-column
          search-placeholder="搜索用户信息"
          hide-filter
          hide-import
          hide-export
        >
          <template #table-action>
            <q-btn
              unelevated
              dense
              label="添加主体"
              class="q-ml-sm q-px-md primary-btn"
              @click="bindUsersForm = true"
            />
          </template>
          <template #body-cell-departments="props">
            <q-td :props="props">
              <q-chip
                v-for="(dept, idx) in (props.row.departments as Department[])"
                :key="idx"
                size="12px"
                square
                color="secondary"
                class="q-ml-none"
              >
                {{ dept.name }}
              </q-chip>
            </q-td>
          </template>
          <template #body-cell-is_deleted="props">
            <q-td :props="props">
              <boolean-chip
                :value="!props.row.is_deleted"
                true-label="正常"
                false-label="禁用"
              />
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props">
              <dropdown-button
                :buttons="[
                  {
                    label: '移除主体',
                    icon: 'person_remove',
                    actionType: 'unbind',
                  },
                ]"
                @click.stop
                @unbind="unbindUsers(role, [props.row], refreshRoleData)"
              />
            </q-td>
          </template>
        </data-table>
      </q-tab-panel>
      <q-tab-panel name="perms">
        <div class="q-pa-sm row items-center">
          <div class="text-caption">应用：</div>
          <q-scroll-area
            :thumb-style="thumbStyle"
            style="height: 36px; width: calc(100% - 40px)"
          >
            <div class="row no-wrap q-gutter-col-xs">
              <q-chip
                v-for="item in applicationChips"
                :key="item.id"
                clickable
                square
                :color="
                  selectedApplication.id === item.id ? 'info' : 'secondary'
                "
                @click="clickApplicationChip(item)"
              >
                <q-avatar
                  :color="
                    selectedApplication.id === item.id ? 'primary' : 'secondary'
                  "
                  :text-color="
                    selectedApplication.id === item.id
                      ? 'white'
                      : $q.dark.isActive
                      ? 'grey-1'
                      : 'grey-10'
                  "
                >
                  12
                </q-avatar>
                {{ item.name }}
              </q-chip>
            </div>
          </q-scroll-area>
        </div>
        <div class="q-pa-sm q-pb-md row items-center">
          <div class="text-caption">标签：</div>
          <div class="q-gutter-col-xs">
            <q-chip
              v-for="item in tagChips"
              :key="item.id"
              clickable
              size="12px"
              :color="selectedTags.includes(item.id) ? 'primary' : 'secondary'"
              :text-color="selectedTags.includes(item.id) ? 'white' : ''"
              @click="clickTagChip(item)"
            >
              <span class="material-icons-outlined q-pr-xs"> local_offer </span>
              {{ item.name }}
            </q-chip>
          </div>
        </div>

        <data-table
          ref="permissionTable"
          api-method="POST"
          api-url="/permissions/query"
          :columns="permColumns"
          search-placeholder="搜索权限信息"
          hide-import
          hide-export
        >
          <template #extra-filters>
            <q-checkbox
              v-model="linkedPermCheck"
              label="仅展示已关联该角色的权限"
              @update:model-value="filterLinkedPerms"
            />
          </template>
          <template #body-cell-linked="props">
            <q-td :props="props">
              <q-checkbox
                v-model="props.row.linked"
                @update:model-value="(val) => toggleLinked(val, props.row.id)"
              />
            </q-td>
          </template>
          <template #body-cell-tags="props">
            <q-td :props="props">
              <q-chip
                v-for="(tag, idx) in props.row.tags"
                :key="idx"
                size="12px"
                color="secondary"
                class="q-ml-none"
              >
                <span class="material-icons-outlined q-pr-xs">
                  local_offer
                </span>
                {{ tag.name }}
              </q-chip>
            </q-td>
          </template>
          <template #body-cell-application="props">
            <q-td :props="props">
              <q-chip
                size="12px"
                square
                color="secondary"
                class="q-ml-none"
                :label="props.row.application.name"
              />
            </q-td>
          </template>
          <template #body-cell-is_deleted="props">
            <q-td :props="props">
              <boolean-chip
                :value="!props.row.is_deleted"
                true-label="正常"
                false-label="禁用"
              />
            </q-td>
          </template>
        </data-table>
      </q-tab-panel>
    </template>
    <template #dialog>
      <form-dialog
        ref="bindUsersDialog"
        v-model="bindUsersForm"
        title="添加主体"
        width="450px"
        @confirm="saveBindUsersForm"
        @close="resetBindUsersForm"
      >
        <template #form-content>
          <div class="q-gutter-md q-pa-md">
            <div>
              <field-label text="关联主体" required />
              <q-select
                ref="select"
                v-model="selectedUsers"
                :options="userOptions"
                placeholder="输入用户姓名进行搜索"
                filled
                dense
                use-input
                hide-dropdown-icon
                multiple
                map-options
                virtual-scroll-slice-size="5"
                @filter="searchUser"
                @update:model-value="clearFilter"
              >
                <template #no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      找不到任何匹配项
                    </q-item-section>
                  </q-item>
                </template>
                <template #selected-item="scope">
                  <q-chip
                    removable
                    dense
                    :tabindex="scope.tabindex"
                    color="primary"
                    text-color="white"
                    class="q-pa-sm"
                    :label="scope.opt.name"
                    @remove="scope.removeAtIndex(scope.index)"
                  />
                </template>
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <boolean-chip
                        :value="!scope.opt.is_deleted"
                        true-label="正常"
                        false-label="禁用"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        {{ scope.opt.name }}（{{ scope.opt.username }}）
                      </q-item-label>
                      <q-item-label caption>
                        {{ scope.opt.mobile }} {{ scope.opt.email }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section v-if="!!scope.opt.org_type" side>
                      <q-chip
                        square
                        size="12px"
                        :label="scope.opt.org_type.name"
                        class="q-pa-sm bg-secondary"
                      />
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <div
                v-if="!!bindUsersFormError.user_ids"
                class="error-hint text-negative"
              >
                {{ bindUsersFormError.user_ids }}
              </div>
            </div>
            <div v-if="!!role.org_type" class="text-caption hint-label">
              提示：该角色为组织类型【{{
                role.org_type.name
              }}】角色，因此只能搜索到【{{
                role.org_type.name
              }}】下的用户进行关联。如未搜索到目标用户，请先检查其组织归属。
            </div>
          </div>
        </template>
      </form-dialog>
    </template>
  </profile-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { QSelect, QTableProps, VueStyleObjectProp } from 'quasar';

import { FormDialogComponent } from 'components/dialog/type';
import { FormAction } from 'components/form/type';
import { RoleOperationsMixin } from 'components/role/RoleOperations';
import { DataTableComponent } from 'components/table/type';
import { ProfileComponent } from 'layouts/type';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Application, Department, Tag } from '../type';
import { User } from '../user/type';

import {
  BindUsersToRolesPostData,
  BindUsersToRolesPostError,
  Role,
} from './type';

const userColumns: QTableProps['columns'] = [
  {
    name: 'name',
    label: '姓名',
    align: 'left',
    field: 'name',
  },
  {
    name: 'username',
    label: '用户名',
    align: 'left',
    field: 'username',
  },
  {
    name: 'mobile',
    label: '手机号',
    align: 'left',
    field: 'mobile',
  },
  {
    name: 'email',
    label: '邮箱',
    align: 'left',
    field: 'email',
  },
  {
    name: 'departments',
    label: '直属组织',
    align: 'left',
    field: 'departments',
  },
  {
    name: 'is_deleted',
    label: '状态',
    align: 'left',
    field: 'is_deleted',
    sortable: true,
  },
  {
    name: 'actions',
    label: '操作',
    align: 'left',
    field: 'actions',
  },
];

const permColumns: QTableProps['columns'] = [
  {
    name: 'linked',
    label: '关联',
    align: 'left',
    field: 'linked',
  },
  {
    name: 'name',
    label: '权限名称',
    align: 'left',
    field: 'name',
  },
  {
    name: 'code',
    label: '权限代码',
    align: 'left',
    field: 'code',
  },
  {
    name: 'tags',
    label: '标签',
    align: 'left',
    field: 'tags',
  },
  {
    name: 'application',
    label: '所属应用',
    align: 'left',
    field: 'application',
  },
  {
    name: 'is_deleted',
    label: '状态',
    align: 'left',
    field: 'is_deleted',
  },
];

export default defineComponent({
  name: 'RoleProfile',

  mixins: [RoleOperationsMixin],

  props: {
    roleId: {
      type: String,
      default: null,
    },
    tab: {
      type: String,
      default: 'role',
    },
  },

  setup() {
    return {
      role: ref<Role>({
        id: '',
      }),
      panelTab: ref('role'),
      userColumns: userColumns,
      permColumns: permColumns,

      bindUsersForm: ref(false),
      userOptions: ref([]),
      selectedUsers: ref<User[]>([]),
      bindUsersFormData: ref<BindUsersToRolesPostData>({}),
      bindUsersFormError: ref<BindUsersToRolesPostError>({}),

      linkedPermCheck: ref(false),
      applicationChips: ref<Application[]>([]),
      selectedApplication: ref<Application>({ id: '' }),
      tagChips: ref<Tag[]>([]),
      selectedTags: ref<string[]>([]),

      thumbStyle: ref<VueStyleObjectProp>({
        right: '2px',
        borderRadius: '2px',
        backgroundColor: '#f2f2f2',
        height: '2px',
        opacity: '0.75',
      }),

      FormAction,
    };
  },

  mounted() {
    this.panelTab = this.tab ? this.tab : this.panelTab;
    this.loadRoleInfo();
  },

  methods: {
    async loadRoleInfo() {
      const resp = await this.$api.get(`/roles/${this.roleId}`);
      this.role = resp.data;
    },

    switchPanelTab(val: string) {
      if (val === 'users') {
        setTimeout(() => {
          const et = this.$refs.userTable as DataTableComponent;
          et.setApiInfo(`/roles/${this.role.id}/users`, 'POST');
          et.fetchRows();
        }, 20);
      } else if (val === 'perms') {
        this.loadApplicationOptions();
        this.loadTagOptions();
      }
    },

    async loadApplicationOptions() {
      this.selectedApplication = { id: '' };
      const resp = await this.$api.post('/applications/query', {});
      this.applicationChips = resp.data.rows;
    },

    async loadTagOptions() {
      this.selectedTags = [];
      const resp = await this.$api.get('/permission_tags');
      this.tagChips = resp.data.permission_tags;
    },

    searchUser(
      val: string,
      update: (fn: () => void) => void,
      abort: () => void
    ) {
      const kw = val.trim();
      if (kw === '') {
        abort();
        return;
      }
      update(async () => {
        let resp = await this.$api.post('/users/query', {
          q: kw,
          org_type_id: this.role.org_type?.id,
          include_unassigned_users: !!this.role.org_type ? false : true,
        });
        this.userOptions = resp.data.rows;
      });
    },

    clearFilter() {
      (this.$refs.select as QSelect).updateInputValue('');
    },

    async saveBindUsersForm() {
      this.bindUsersFormData.user_ids = this.selectedUsers
        ? this.selectedUsers.map((user) => user.id)
        : [];
      this.bindUsersFormData.role_ids = [this.role.id];
      try {
        this.bindUsersFormError = {};
        await this.$api.post('/roles/bind_users', this.bindUsersFormData, {
          successMsg: '主体添加成功',
        });
        (this.$refs.bindUsersDialog as FormDialogComponent).hide();
        (this.$refs.userTable as DataTableComponent).fetchRows();
        this.loadRoleInfo();
        this.resetBindUsersForm();
      } catch (e) {
        this.bindUsersFormError = (e as Error).cause || {};
      }
    },

    resetBindUsersForm() {
      this.bindUsersFormData = {};
      this.bindUsersFormError = {};
      this.selectedUsers = [];
    },

    refreshRoleData(op: string) {
      if (['disable', 'enable'].includes(op)) {
        this.loadRoleInfo();
      } else if (op === 'delete') {
        (this.$refs.profile as ProfileComponent).goBack();
      } else if (op === 'unbind') {
        this.loadRoleInfo();
        (this.$refs.userTable as DataTableComponent).fetchRows();
      }
    },

    filterLinkedPerms() {
      console.error('TODO');
    },

    clickApplicationChip(app: Application) {
      this.selectedApplication =
        this.selectedApplication.id === app.id ? { id: '' } : app;
      this.loadPermissionsbyApp();
    },

    clickTagChip(tag: Tag) {
      if (this.selectedTags.includes(tag.id)) {
        this.selectedTags = this.selectedTags.filter((tid) => tid != tag.id);
      } else {
        this.selectedTags.push(tag.id);
      }
    },

    async loadPermissionsbyApp() {
      const pt = this.$refs.permissionTable as DataTableComponent;
      if (!!this.selectedApplication.id) {
        pt.onExternalFiltered('application_id', this.selectedApplication.id);
      } else {
        pt.removeExternalFilter('application_id');
      }
    },

    async toggleLinked(ticked: boolean, permission_id: string) {
      await this.$api.post(
        ticked ? '/permissions/bind_roles' : '/permissions/unbind_roles',
        { role_ids: [this.role.id], permission_ids: [permission_id] },
        {
          successMsg: ticked ? '关联成功' : '移除成功',
        }
      );
    },
  },
});
</script>

<style lang="scss" scoped></style>
