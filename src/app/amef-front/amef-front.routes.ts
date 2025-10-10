import { Routes } from "@angular/router";
import { HomePageComponent } from "./pages/home-page/home-page.component";
import { LayoutAmefFrontComponent } from "./layout/layout-amef-front/layout-amef-front.component";


export const amefFrontRoutes: Routes = [
  {
    path: '',
    component: LayoutAmefFrontComponent,
    children: [
      {
        path: '',
        component: HomePageComponent
      }
    ]
  }
]


export default amefFrontRoutes;
