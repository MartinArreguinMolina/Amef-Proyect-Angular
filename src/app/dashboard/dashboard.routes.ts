import { Routes } from "@angular/router";
import { LayoutDashboardComponent } from "./layout/layout-dashboard/layout-dashboard.component";
import { AmefComponent } from "./pages/amef/amef.component";
import { OrganizationalInformationComponent } from "./pages/organizational-information/organizational-information.component";
import { AnalysisComponent } from "./pages/analysis/analysis.component";
import { ActionsComponent } from "./pages/actions/actions.component";
import { GraphicsComponent } from "./pages/graphics/graphics.component";
import { isAdminGuard } from "../auth/guard/isAdmin.guard";
import { superAdminGuard } from "../auth/guard/super-admin.guard";


export const dashBoardRoutes: Routes = [
  {
    path: '',
    component: LayoutDashboardComponent,
    children: [
      {
        path: '',
        component: AmefComponent
      },
      {
        path: 'organizational-information',
        component: OrganizationalInformationComponent,
        canMatch: [
          superAdminGuard
        ],
      },
      {
        path: 'amef/:amefId/analysis',
        component: AnalysisComponent,
        canMatch: [
          isAdminGuard
        ],
      },
      {
        path: 'amef/:amefId/analysis/:analysisId/actions',
        component: ActionsComponent,
        canMatch: [
          isAdminGuard
        ],
      },
      {
        path: 'graphics',
        component: GraphicsComponent
      }
    ]
  }
]

export default dashBoardRoutes;
