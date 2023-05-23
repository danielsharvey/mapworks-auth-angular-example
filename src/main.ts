import 'zone.js/dist/zone';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { MapworksMapService } from './app/mapworks';

declare let Studio: any;

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('callback') === '') {
  console.log('GOT CALLBACK');
  (async () => {
    await new MapworksMapService().loadStudio();
    Studio.OidcClient.signinCallback();
  })();
} else {
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
}
