import { InjectionToken } from "@angular/core";
import { MapworksAccess, MapworksStudioConfigOptions } from "./mapworks";

/*
 * this configuration needs to be updated if you are running locally or forked
 */

export const appConfig = {
  mapworksOrgUrl: 'https://app.mapworks.io',
  client_id: '3mvor82v8k8f6nbi4f8bpihsom',
  mapRef: 'map-osm-public',
  layerRef: 'ne_10m_populated_places',
  secondLayerRef: 'places',
  thirdLayerRef: 'world_boundaries_m_ll_wgs84',
};

export type AppConfig = typeof appConfig;
export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

/*
 * this configuration should generally work but may be adapted for your use
 */

const appUrl = window.location.origin;

const width = 400;
const left = (screen.width - width) / 2;
const height = 550;
const top = (screen.height - height) / 2;

const scope = [
  'openid',
  'email',
  'profile',
  // 'https://apis.mapworks.io/auth/mapsengine.superadmin',
  // 'https://apis.mapworks.io/auth/mapsengine',
  'https://apis.mapworks.io/auth/mapsengine.readonly',
  // 'https://apis.mapworks.io/auth/org-management',
  // 'https://apis.mapworks.io/auth/org-management.groups',
  // 'https://apis.mapworks.io/auth/org-management.readonly',
  // 'https://apis.mapworks.io/auth/org-subscriber',
  // 'https://apis.mapworks.io/auth/org-management.accounts',
  // 'https://apis.mapworks.io/auth/org-management.accounts.readonly',
  // 'https://apis.mapworks.io/auth/org-management.invitations',
  // 'https://apis.mapworks.io/auth/individual-subscriber',
].join(' ');

export const studioConfig: MapworksStudioConfigOptions = {
  mapworksPath: appConfig.mapworksOrgUrl,
  mapRef: appConfig.mapRef,
  access: MapworksAccess.Anonymous,

  zoomControl: false, // defaults is true
  scaleControl: true, // default is false
  // tooltipControl: true, // default is true
  timeControl: false, // default is false
  offlineIndicatorControl: true, // default is true

  navigationControl: false, // default is false
  appNavigationControl: true, // default is true

  toolbarControl: true, // default is true
  simpleLayersPanel: false, // default is false

  mapworksLoginProvider: {
    authority: appConfig.mapworksOrgUrl, // /.well-known/openid-configuration
    client_id: appConfig.client_id,
    redirect_uri: appUrl + '/?callback', // '/public/login-callback.html',
    silent_redirect_uri: appUrl + '/?callback', // '/public/login-callback.html',
    popup_redirect_uri: appUrl + '/?callback', // '/public/login-callback.html',
    post_logout_redirect_uri: appUrl,
    anonymousUser: 'noreply@public-anonymous.mapworks.io',
    popupWindowFeatures: {
      location: false,
      toolbar: false,
      width,
      height,
      left,
      top,
    },
    response_type: 'code',
    scope,
    prompt: 'select_account',
    automaticSilentRenew: true,
    loadUserInfo: true,
  },
};

