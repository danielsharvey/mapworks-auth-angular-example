import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  Observable,
  Subject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  map,
  of,
  switchMap,
  take,
  tap,
  throttleTime,
  withLatestFrom,
} from 'rxjs';
import { MapworksMapService } from '../mapworks-map.service';
import {
  MapworksFeatureEvent,
  MapworksLayerSearchInput,
  MapworksMap,
  MapworksTreeEntity,
  MapworksTreeLayerEntity,
  fromEvent,
  searchFeatures_Output,
} from '../mapworks';
import { MapPointMarker } from './map-point-marker.class';
import { APP_CONFIG, AppConfig } from '../app.config';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';

interface CollatedSearchResult {
  map: MapworksMap;
  layers: MapworksTreeLayerEntity[];
  queryResult?: searchFeatures_Output;
}

interface CollatedSearchResultRow {
  type: 'knownArea';
  map: MapworksMap;
  layer: MapworksTreeLayerEntity;
  row: searchFeatures_Output['data'][0]['data'][0];
}

interface IncidentFilterSearchTerm {
  type: 'incidentFilter';
  value: string;
}

interface CommentFilterSearchTerm {
  type: 'commentFilter';
  value: string;
}

type AutocompleteRow = CollatedSearchResultRow | IncidentFilterSearchTerm | CommentFilterSearchTerm;

/**
 *
 */
@Component({
  selector: 'app-map-search-autocomplete',
  templateUrl: './map-search-autocomplete.component.html',
  // styleUrls: ['./map-search-autocomplete.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
})
export class MapSearchAutocompleteComponent {

  @Input() mxMap!: MapworksMap;

  private _layers!: MapworksTreeLayerEntity[];
  @Input() set layers(layers: MapworksTreeEntity[]) {
    layers = layers.filter(v => !!v);
    this._layers = layers as MapworksTreeLayerEntity[]; // XXX TODO

    // compile and store the search result template
    this.searchResultFormatTemplates = this._layers.map(layer => {
      const format = layer.getSearchResultFormat() ?? layer.getSearchFormat();
      return Studio._.template(format, {
        interpolate: /\|([\s\S]+?)\|/g
      });
    });
  }
  get layers(): MapworksTreeLayerEntity[] {
    return this._layers;
  }

  searchResultFormatTemplates!: ((data?:any) => string)[];

  /// lookup of the layers we're want to search
  readonly layers$: Observable<MapworksTreeLayerEntity[]>;

  // XXX TODO this is not absolutely required as we capture selected option
  readonly searchSubj = new Subject<string>();
  readonly search$ = this.searchSubj.asObservable();

  readonly searchResult$: Observable<CollatedSearchResult>;

  private showLogging = false;

  searchControl = new FormControl('');

  constructor(
    @Inject(APP_CONFIG) public appConfig: AppConfig,
    private mapService: MapworksMapService,
    private httpClient: HttpClient,
    private changeDetector: ChangeDetectorRef,
  ) {

    // this.searchControl.valueChanges.pipe(
    //   takeUntilDestroyed(),
    //   tap(s => console.log('-->', s)),
    // ).subscribe();

    const map$ = mapService.mapService.map$;

    this.layers$ = map$.pipe(
      map(map_ => {
        return [appConfig.layerRef, appConfig.secondLayerRef].map(
          (ref) => map_.getTree().findByReferenceId(ref) as MapworksTreeLayerEntity
        );
      }),
    );

    this.searchResult$ = combineLatest([
      this.searchControl.valueChanges,
      mapService.mapService.accessToken$,
    ]).pipe(
      filter(([s, at]) => s !== null && s.length > 2),
      distinctUntilChanged(),
      debounceTime(300),
      switchMap(([s, at]) => {
        const postData = this.layers.map(l => this.getSearchPostData(s!, l.getFeatureSetId(), l.getSearchFormat()));
        return this.httpClient.post<searchFeatures_Output>(
          'https://api.mapworks.io/resources/feature/search',
          postData.flat(), // note use of flat() to obtain the correct shape
          {
            headers: {
              Authorization: `Bearer ${at}`,
            },
          }
        ).pipe(
          map((result): CollatedSearchResult => {
            return {
              map: this.mxMap,
              layers: this.layers,
              queryResult: result,
            }
          }),
          catchError((e) => of({ map:this.mxMap, layers:this.layers} as CollatedSearchResult)),
        );
      }),
      // tap(result => {
      //   console.log('RESULT', result);
      // }),
    );

  }

  handleChange(event: Event) {
    const search = (event.target as HTMLInputElement)?.value;
    // console.log('GOT', search);
    this.searchSubj.next(search);
  }

  async handleOptionSelected(event: MatAutocompleteSelectedEvent) {
    const r = event.option.value as AutocompleteRow;
    if(r.type === 'knownArea') {
      const [f] = await ((<any>r.layer).downloadFeatures([r.row.id]));
      f.select();
      await f.zoom();
    } else if(r.type === 'incidentFilter') {
      console.log('handleOption', 'incidentFilter', r.value);
    } else if(r.type === 'commentFilter') {
      console.log('handleOption', 'commentFilter', r.value);
    }
  }

  formatSearchResult(layer: MapworksTreeLayerEntity, row: any): string {
    const format = layer.getSearchResultFormat() ?? layer.getSearchFormat();
    const template = Studio!._.template(format, {
      interpolate: /\|([\s\S]+?)\|/g
    });
    const formatted = template(row.properties);
    return formatted;
  }

  displayFn = (r: AutocompleteRow) => {
    if(r.type === 'knownArea') {
      if(r.layer && r.row) {
        return `${this.formatSearchResult(r.layer, r.row)} (${r.layer.getTitle()})`;
      }
    } else if(r.type === 'incidentFilter') {
      return `Incidents containing "${r.value}"`;
    } else if(r.type === 'commentFilter') {
      return `Comments containing "${r.value}"`;
    }
    return '';
  }

  private getSearchPostData(search: string, featureSetId: string, searchFormat: string) {

    // POST https://api.mapworks.io/resources/feature/search

    return [
      {
        size: 3,
        from: 0,
        featureSetRefs: [
          { id: featureSetId, version: 'latest' },
          // { id: 'AXBR6nPCAAA2ac12AAAB', version: 'latest' },
          // { id: 'AXBR6nO6AAA2ac12AAAA', version: 'latest' },
        ],
        query: {
          match: {
            _all: {
              query: search,
              formats: [[searchFormat]],
              options: [[{}]],
              // location: {
              //   type: 'Point',
              //   coordinates: [115.83055339995201, -31.946705095751526],
              // },
            },
          },
        },
        include: ['id', 'properties', 'extent', 'sourceRef'],
        // filter: {
        //   bounds: {
        //     geometry: {
        //       crs: 'EPSG:4326',
        //       geometry: {
        //         type: 'Polygon',
        //         coordinates: [
        //           [
        //             [-180, -77.1223854506017],
        //             [180, -77.1223854506017],
        //             [180, 77.1223854506017],
        //             [-180, 77.1223854506017],
        //             [-180, -77.1223854506017],
        //           ],
        //         ],
        //       },
        //     },
        //   },
        // },
      },
    ];
  }

  private log(...args: any[]) {
    if (this.showLogging) {
      console.log('MapSearchAutocompleteComponent:', ...args);
    }
  }
}



const sampleResponse = {
  success: true,
  total: 1,
  data: [
    {
      data: [
        {
          extent: {
            bounds: {
              top: 56.40034161287229,
              left: -3.469979697066492,
              right: -3.469979697066492,
              bottom: 56.40034161287229,
            },
          },
          formats: ['|name|'],
          sourceRef: {
            id: '113',
            version: 'latest',
          },
          id: '2384',
          properties: {
            name: 'Perth',
            // ...
          },
        },
        {
          extent: {
            bounds: {
              top: -31.953068770730166,
              left: 115.83805287904272,
              right: 115.83805287904272,
              bottom: -31.953068770730166,
            },
          },
          formats: ['|name|'],
          sourceRef: {
            id: '113',
            version: 'latest',
          },
          id: '7221',
          properties: {
            name: 'Perth',
            // ...
          },
        },
      ],
      success: true,
      total: 2,
    },
  ],
};

const SampleRequest = [
  {
    size: 3,
    from: 0,
    featureSetRefs: [{ id: 'AXBR6nPCAAA2ac12AAAB', version: 'latest' }],
    query: {
      match: {
        _all: {
          query: 'barc',
          formats: [['|name|']],
          options: [[{}]],
          location: {
            type: 'Point',
            coordinates: [0.3192390691058904, -9.742139112077762],
          },
        },
      },
    },
    include: ['id', 'properties', 'extent', 'sourceRef'],
    filter: {
      bounds: {
        geometry: {
          crs: 'EPSG:4326',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-180, -77.1223854506017],
                [180, -77.1223854506017],
                [180, 77.1223854506017],
                [-180, 77.1223854506017],
                [-180, -77.1223854506017],
              ],
            ],
          },
        },
      },
    },
  },
  {
    size: 3,
    from: 0,
    featureSetRefs: [{ id: 'AXBR6nO6AAA2ac12AAAA', version: 'latest' }],
    query: {
      match: {
        _all: {
          query: 'barc',
          formats: [['|place_name|']],
          options: [[{}]],
          location: {
            type: 'Point',
            coordinates: [0.3192390691058904, -9.742139112077762],
          },
        },
      },
    },
    include: ['id', 'properties', 'extent', 'sourceRef'],
    filter: {
      bounds: {
        geometry: {
          crs: 'EPSG:4326',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-180, -77.1223854506017],
                [180, -77.1223854506017],
                [180, 77.1223854506017],
                [-180, 77.1223854506017],
                [-180, -77.1223854506017],
              ],
            ],
          },
        },
      },
    },
  },
];
