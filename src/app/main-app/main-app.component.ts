import {
  Component,
  ElementRef,
  Inject,
  Injector,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  MapworksFeatureDisplayContext,
  MapworksFeatureDisplayTemplates,
  MapworksFeatureEntity,
  MapworksStudioTooltipControl,
  MapworksUser,
} from '../mapworks';
import { MapworksMapService } from '../mapworks-map.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_CONFIG, AppConfig } from '../app.config';

@Component({
  selector: 'app-main-app',
  templateUrl: './main-app.component.html',
  styleUrls: ['./main-app.component.css'],
})
export class MainAppComponent implements OnInit {

  // reference to the <div> in which we will place the Mapworks map
  @ViewChild('map', { static: true }) map!: ElementRef;

  user$: Observable<MapworksUser | null>;
  accessToken$: Observable<string | undefined>;

  private showLogging = false;

  constructor(
    @Inject(APP_CONFIG) public appConfig: AppConfig,
    public mapService: MapworksMapService,
    private injector: Injector
  ) {
    this.user$ = mapService.mapService.user$;
    this.accessToken$ = mapService.mapService.accessToken$;

    /*
     * mouseover/tooltip/mouse-click customisations
     * NOTE: these only apply to the configured layer
     */

    // template function for the mouseover template
    const mouseoverTplFn = (context: MapworksFeatureDisplayContext) => {
      /* use this logging to see the detail within the context object provided
       * for mouseover/tooltip/click display */
      this.log('mouseover', 'context:MapworksFeatureDisplayContext', context);

      /* provide the context object to the map service for use by the custom
       * element injected below */
      this.mapService.setFeatureDisplayContext(context);

      // standard template outline with our custom element based mouseover
      return this.mapService.getMouseoverTemplate(
        context.className,
        '<app-mouseover-element mode="display"></app-mouseover-element>'
      );
    };

    // template function for the (simulated) "loading" dialog
    const loadingTplFn = (context: MapworksFeatureDisplayContext) => {
      this.log('mouseclick', 'context:MapworksFeatureDisplayContext', context);
      return this.mapService.getMouseoverTemplate(
        context.className,
        '<app-mouseover-element mode="loading"></app-mouseover-element>'
      );
    };

    // template function for the mouse click template
    const clickTpl = (
      context: MapworksFeatureDisplayContext,
      originalTpl: (context: MapworksFeatureDisplayContext) => string
    ) => {
      this.log(
        'mouseclick (2)',
        'context:MapworksFeatureDisplayContext',
        context
      );

      // TODO: Workaround until bug in Studio is fixed.
      // @see https://jira.amristar.com/browse/ST-7033
      const $html = this.mapService.mapService.Studio!.$(
        originalTpl(context).replace('"arrow" />', '"arrow"></div>')
      );

      // use JQuery to insert custom HTML into the standard mouse click template
      const $title = $html.find('.popover-title');
      $title.prepend(
        '<app-mouseover-element mode="logo"></app-mouseover-element>'
      );

      return $html;
    };

    this.mapService.mapService.map$
      .pipe(
        takeUntilDestroyed(),
        tap((map) => {
          this.log('MAP ready');

          const tooltip = map.getControl('tooltip') as MapworksStudioTooltipControl;
          this.log('tooltip control', tooltip);

          /*
           * mouseover/tooltip/mouse-click customisations are applied via the
           * tooltip 'before:render' event
           */
          tooltip.on(
            'before:render',
            (feature: MapworksFeatureEntity, templateObject: MapworksFeatureDisplayTemplates, cb) => {
              this.log(
                'tooltip before:render', 'feature:MapworksFeatureEntity', feature,
                'templateObject:MapworksFeatureDisplayTemplates', templateObject
              );
              const layerRef = feature.attributes.layer.getReferenceId();
              this.log('layer-ref', layerRef);

              /*
               * Mouseover/tooltip/mouse-click customisations are applied
               * by replacing the template functions in the templateObject
               * parameter. We do this selectively only for the configuration
               * layer
               */
              if (layerRef === appConfig.layerRef) {
                if (templateObject.mouseoverTpl) {
                  // handle mouseover
                  templateObject.mouseoverTpl = mouseoverTplFn;
                } else if (templateObject.clickTpl) {
                  // handle mouseclick
                  const originalTpl = templateObject.clickTpl;
                  templateObject.clickTpl = loadingTplFn;
                  // simulate 2s "async" load before using callback to re-render tooltip
                  setTimeout(() => {
                    cb?.({ clickTpl: (context) => clickTpl(context, originalTpl), });
                  }, 2000);
                }
              }
            }
          );
        })
      )
      .subscribe();
  }

  ngOnInit() {
    this.mapService.mapService.initMap(
      this.map.nativeElement,
      this.mapService.studioConfig
    );
  }

  doSignOut() {
    this.mapService.mapService.signoutRedirect();
  }

  private log(...args: any[]) {
    if (this.showLogging) {
      console.log('MainAppComponent:', ...args);
    }
  }
}
