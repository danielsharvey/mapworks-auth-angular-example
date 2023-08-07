import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";
import { RoutingTestComponent } from "./routing-test.component";
import { RoutingTestChildComponent } from "./routing-test-child.component";

export const routes: Route[] = [
  {
    path: '',
    component: RoutingTestComponent,
    children: [
      {
        path: 'specific-route',
        component: RoutingTestChildComponent,
        data: {
          type: 'specific-route',
        }
      },
      {
        path: '**',
        component: RoutingTestChildComponent,
        data: {
          type: 'wildcard',
        }
      },
    ],
  }];

@NgModule({
  declarations: [
    RoutingTestComponent,
    RoutingTestChildComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class RoutingTestModule {}
