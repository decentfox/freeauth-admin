import { OrgType } from 'pages/type';

export interface OrgTypeSelectComponent {
  openOrgTypeForm: (orgType?: OrgType) => void;
}
