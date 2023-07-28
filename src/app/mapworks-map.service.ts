import { Inject, Injectable, InjectionToken, Injector } from '@angular/core';
import { MapworksMapService as TheMapworksMapService, MapworksStudioConfigOptions, MapworksFeatureEntity, MapworksFeatureDisplayContext } from './mapworks';
import { MAPWORKS_MOUSEOVER_DATA, MouseoverDataProvider } from './mouseover';
import { BehaviorSubject } from 'rxjs';
import { createCustomElement } from '@angular/elements';
import { MouseoverComponent } from './mouseover/mouseover.component';

export const MAPWORKS_STUDIO_CONFIG_OPTIONS = new InjectionToken<MapworksStudioConfigOptions>(
  'MAPWORKS_STUDIO_CONFIG_OPTIONS'
);

@Injectable({
  providedIn: 'root'
})
export class MapworksMapService {

  public readonly mapService: TheMapworksMapService;

  private readonly featureContextSubj = new BehaviorSubject<MapworksFeatureDisplayContext | undefined>(undefined);
  private featureContext$ = this.featureContextSubj.asObservable();

  constructor(
    private injector: Injector,
    @Inject(MAPWORKS_STUDIO_CONFIG_OPTIONS) public readonly studioConfig: MapworksStudioConfigOptions
  ) {
    this.mapService = new TheMapworksMapService(studioConfig.mapworksLoginProvider);

    /*
     * wiring for mouseover custom element
     */
    const provider: MouseoverDataProvider = {
      context$: this.featureContext$,
    };

    const mouseoverInjector: Injector = Injector.create({
      providers: [
        { provide: MAPWORKS_MOUSEOVER_DATA, useValue: provider },
      ],
      parent: this.injector,
    });

    const element = createCustomElement(MouseoverComponent, {
      injector: mouseoverInjector,
    });
    customElements.define('app-mouseover-element', element);
  }

  public async isSignedIn(): Promise<boolean> {
    try {
    return !!(await this.mapService.getUser());
    } catch(err) {
      console.error(`isSignedIn(): ERROR: ${err}`);
      console.error(err);
      return false;
    }
  }

  /**
   * Set the current Mapworks feature context object supplied to the
   * mouseover/tooltip/mouse-click template render function (used to render a
   * mouseover/tooltip/mouse-click template) via a custom element.
   *
   * @param context the context object
   */
  public setFeatureDisplayContext(context: MapworksFeatureDisplayContext): void {
    this.featureContextSubj.next(context);
  }

  /**
   * Return the standard Mapworks template with the specified
   * HTML content inserted.
   *
   * The standard template shows have a light background, border
   * with shadow and a "marker arrow" as part of the top border to
   * identify the feature on the map with which the mouseover/tooltip
   * is associated.
   *
   * @param className the classname to use for the container (provided in the
   *                  MapworksFeatureDisplayContext object)
   * @param htmlContent the HTML content to be inserted into the standard
   *                    template
   * @returns the HTML template content
   */
  public getMouseoverTemplate(className: string, htmlContent: string) {
    return `
      <div id="studio-tooltip-mouseover" class="${className}" >
      <div class="popover popover-mouseover bottom" style="">
        <div class="arrow"></div>
        <!-- <h3 class="popover-title"></h3> -->
        ${htmlContent}
      </div>
      </div>
    `;
  }

}
