import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ExtraOptions, PreloadAllModules, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';

import { appRoutes } from './app.routing';
import {
  CanActivateIfNotSignedInGuard,
  CanActivateIfSignedInGuard,
} from './mapworks-auth-guard.guard';

import { MAPWORKS_STUDIO_CONFIG_OPTIONS } from './mapworks-map.service';
import { APP_CONFIG, appConfig, studioConfig } from './app.config';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const routerConfig: ExtraOptions = {
  preloadingStrategy: PreloadAllModules,
  scrollPositionRestoration: 'enabled',
};

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, BrowserAnimationsModule, HttpClientModule, RouterModule.forRoot(appRoutes, routerConfig)],
  providers: [
    { provide: APP_CONFIG, useValue: appConfig },
    { provide: MAPWORKS_STUDIO_CONFIG_OPTIONS, useValue: studioConfig },
    CanActivateIfSignedInGuard,
    CanActivateIfNotSignedInGuard,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
