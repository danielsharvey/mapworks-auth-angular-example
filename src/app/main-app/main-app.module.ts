import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainAppComponent } from './main-app.component';
import { Route, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MapEventsDisplayComponent,
  MapEventsDisplayFeatureComponent,
} from './map-events-display.component';
import { MapSearchAutocompleteComponent } from './map-search-autocomplete.component';
import { BrowserModule } from '@angular/platform-browser';

export const routes: Route[] = [
  {
    path: '',
    component: MainAppComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('../routing-test/routing-test.module').then((m) => m.RoutingTestModule),
      },
    ],
  },
];

@NgModule({
  declarations: [
    MainAppComponent,
    MapEventsDisplayComponent,
    MapEventsDisplayFeatureComponent,
    MapSearchAutocompleteComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MainAppModule {}
