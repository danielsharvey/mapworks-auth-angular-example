# Mapworks Auth Example (Angular)

This example illustrates utilising Mapworks Auth with an Angular web application.

The specfic use case includes accessing auth via Mapworks, and requiring sign-in prior to the use of a Mapworks map component (via protected Angular routes).

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.0.0.

## Running in CodeSandbox

This example may be run in CodeSandbox:

- https://codesandbox.io/p/github/mapworksio/mapworks-auth-angular-example

## Using the Mapworks code

The [src/app/mapworks](src/app/mapworks) subfolder may be copied and used directly in web application code.

- [src/app/mapworks](src/app/mapworks) - this contains the `MapworksMapService` class used to manage auth and map initialisation.
- [src/main.ts](src/main.ts) - contains code to handle the OAuth2/OIDC callback used as part of the sign in process (this will need to be incorporated or use `login-callback.html`)
- [src/assets/login-callback.html](src/assets/login-callback.html) - this handles the OAuth2/OIDC callback used as part of the sign in process (preferred in non-CodeSandbox environments)

Note that due to constraints of the CodeSandbox environment, the OAuth2/OIDC callback is handled in [src/main.ts](src/main.ts) - for non-CodeSandbox you are probably better utilising the static `login-callback.html` (`app-config.ts` needs to be updated to reflect this).

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
