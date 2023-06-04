# Mapworks Auth Example (Angular)

This example illustrates utilising Mapworks Auth with an Angular web application.

The specfic use case includes accessing auth via Mapworks, and requiring sign-in prior to the use of a Mapworks map component (via protected Angular routes).

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.0.0.

## Running in CodeSandbox

This example may be run in CodeSandbox:

- https://codesandbox.io/p/github/mapworksio/mapworks-auth-angular-example


## Mapworks Community

If you have any questions, please feel free to join the discussion on this
[Mapworks Community discussion topic](https://community.mapworks.io/).


## Application configuration

As configured, this example web application makes use of the following Mapworks resources:

- Organisation: https://app.mapworks.io/
- Application: [Mapworks Example Application](https://app.mapworks.io/settings/application/an0raTjbw6A6Kno8s8Bw2/details)
- Map: [OpenStreetMap](https://app.mapworks.io/content/#/map/AXBR6sWIAAA2ac12AAAA) (`map-osm-public`)

The application configuration (in [src/app/app.config.ts](src/app/app.config.ts)) is as follows:

```ts
const mapworksOrgUrl = 'https://app.mapworks.io';
const client_id = '3mvor82v8k8f6nbi4f8bpihsom';
const mapRef = 'map-osm-public';
```

Notes:

1. This application has been configured in the to operation when running locally
   (http://localhost:4200) and when running on CodeSandbox (link above).

2. If the CodeSandbox application is forked (and as a result, will be accessed on a
   different web application URL) the Mapworks Application `client_id` will need to
   updated to an application configured in your Mapworks Organisation.


## Using the Mapworks code

The [src/app/mapworks](src/app/mapworks) subfolder may be copied and used directly in web application code.

- [src/app/mapworks](src/app/mapworks) - this contains the `MapworksMapService` class used to manage auth and map initialisation.
- [src/main.ts](src/main.ts) - contains code to handle the OAuth2/OIDC callback used as part of the sign in process (this will need to be incorporated or use `login-callback.html`)
- [src/assets/login-callback.html](src/assets/login-callback.html) - this handles the OAuth2/OIDC callback used as part of the sign in process (preferred in non-CodeSandbox environments)

Note that due to constraints of the CodeSandbox environment, the OAuth2/OIDC callback is handled in [src/main.ts](src/main.ts) - for non-CodeSandbox you are probably better utilising the static `login-callback.html` (`app-config.ts` needs to be updated to reflect this).


## Other Examples

Please also see the following related examples:

1. [Mapworks Auth Example - User Sign In before loading map - Developers - Mapworks Community](https://community.mapworks.io/t/mapworks-auth-example-user-sign-in-before-loading-map/30)


## Development server

Run `ng serve` for a dev server. Navigate to http://localhost:4200. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
