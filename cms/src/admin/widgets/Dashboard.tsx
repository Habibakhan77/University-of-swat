import { Widget } from '@strapi/strapi/admin';
import { useDashboard, type DepartmentEditorData, type FacultyData, type SuperAdminData } from './api';
import { MyDepartment } from './MyDepartment';
import { MyProfile } from './MyProfile';
import { SuperAdminOverview } from './SuperAdminOverview';

/**
 * One dashboard widget for every role. The server decides what the signed-in user sees
 * (GET /uswat/dashboard) and scopes the numbers; this picks the matching view.
 */
export function Dashboard() {
  const { data, error } = useDashboard();
  if (error) return <Widget.Error>Could not load your dashboard.</Widget.Error>;
  if (!data) return <Widget.Loading />;
  switch (data.role) {
    case 'super-admin':
      return <SuperAdminOverview data={data as SuperAdminData} />;
    case 'department-editor':
      return <MyDepartment data={data as DepartmentEditorData} />;
    case 'faculty':
      return <MyProfile data={data as FacultyData} />;
    default:
      return <Widget.NoData>No dashboard for your role. Use the Content Manager on the left.</Widget.NoData>;
  }
}
