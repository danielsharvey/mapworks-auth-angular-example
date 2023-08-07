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
  QueryOutput,
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

interface PeliasSearchResultRow {
  type: 'peliasAddress';
  geometry: {
    type: 'Point',
    /// `[long,lat]`
    coordinates: number[];
  },
  properties: {
    id: string;
    layer: string;
    score: number;
    name: string;
    gnaf_pid: string;
    street_locality_pid: string;
    locality_pid: string;
    number_first: string;
    number_last: string;
    street_name: string;
    street_suffix: string;
    locality: string;
    postcode: string;
    state: string;
  };
}

interface IncidentFilterSearchTerm {
  type: 'incidentFilter';
  value: string;
}

interface CommentFilterSearchTerm {
  type: 'commentFilter';
  value: string;
}

type AutocompleteRow = CollatedSearchResultRow | PeliasSearchResultRow | IncidentFilterSearchTerm | CommentFilterSearchTerm;

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
  readonly peliasResult$: Observable<PeliasSearchResultRow[]>;
  readonly resultSummary$: Observable<string | undefined>;

  private showLogging = false;

  searchControl = new FormControl('');

  private _mapPointMarker?: MapPointMarker;
  get mapPointMarker() {
    if (!this._mapPointMarker) {
      this._mapPointMarker = new MapPointMarker(
        this.mapService.mapService.Studio!,
        this.mxMap,
        'pelias-zoom-to-with-marker'
      );
    }
    return this._mapPointMarker;
  }

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

    this.peliasResult$ = this.searchControl.valueChanges.pipe(
      filter((s) => s !== null && s.length > 2),
      distinctUntilChanged(),
      debounceTime(300),
      switchMap((s) => {
        const location = this.mxMap.getViewCenter();
        const params = this.getPeliasQueryParams(s!, location);
        return this.httpClient.get<any>(
          'https://api.mapworks.io/pelias/v1/autocomplete',
          {
            // headers: {
            //   Authorization: `Bearer ${at}`,
            // },
            params,
          }
        ).pipe(
          map((result): any => {
            return result.features.map((f: any) => {
              return {
                ...f,
                type: 'peliasAddress',
              } as PeliasSearchResultRow;
            })
            return result;
          }),
          catchError((e) => of([])),
        );
      }),
    );

    this.resultSummary$ = combineLatest([
      this.searchResult$,
      this.peliasResult$,
    ]).pipe(
      map(([searchResult, peliasResult]) => {
        let total = peliasResult.length;
        let noResults = searchResult.queryResult?.data.map((_layerResult,i) => {
          const layerResult = _layerResult as QueryOutput; // ['data'];
          if(layerResult.data.length === 0) {
            return searchResult.layers[i].getTitle();
          } else {
            total += layerResult.data.length;
            return undefined;
          }
        }).filter(v => !!v) as string[];

        noResults = [
          ...((peliasResult.length === 0) ? ['Addresses'] : []),
          ... noResults
        ];

        if(noResults.length > 0) {
          return [
            ...(total > 0 ? [`${total} results.`] : []),
            `No results for ${noResults.join(', ')}.`,
          ].join(' ');
        } else {
          return undefined;
        }
      }),
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
    } else if(r.type === 'peliasAddress') {
      this.mxMap.animateTo({
        x: r.geometry.coordinates[0],
        y: r.geometry.coordinates[1],
        targetScale: 10000,
        callback: () => {
          const location = this.mxMap.getViewCenter();
          this.mapPointMarker.placeMarker(location);
        },
      });
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
    } else if(r.type === 'peliasAddress') {
      return `${r.properties.name} (Address)`;
    } else if(r.type === 'incidentFilter') {
      return `Incidents containing "${r.value}"`;
    } else if(r.type === 'commentFilter') {
      return `Comments containing "${r.value}"`;
    }
    return '';
  }

  private getPeliasQueryParams(search: string, location: number[]) {
    const params = {
      text: search,
      size: 5,
      'boundary.rect.min_lon': -180,
      'boundary.rect.min_lat': -90,
      'boundary.rect.max_lon': 180,
      'boundary.rect.max_lat': 90,
      'focus.point.lon': location[0], // 115.9346936,
      'focus.point.lat': location[1], // -31.9228887,
      apikey: '<apikey>', // XXX TODO make configurable
      // callback: jQuery22408664779593893466_1690867219137
      _: Date.now(),
    };

    return params;
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

/*

https://api.mapworks.io/pelias//v1/autocomplete?text==75%20gla&size=5&boundary.rect.min_lon=-180&boundary.rect.min_lat=-90&boundary.rect.max_lon=180&boundary.rect.max_lat=90&focus.point.lon=115.9346936&focus.point.lat=-31.9228887&apiKey=RUwzFLjJeb7BsTsxq9oMr4GFd&callback=jQuery22408664779593893466_1690867219137&_=1690867219138


text: =75 gla
size: 5
boundary.rect.min_lon: -180
boundary.rect.min_lat: -90
boundary.rect.max_lon: 180
boundary.rect.max_lat: 90
focus.point.lon: 115.9346936
focus.point.lat: -31.9228887
apikey: RUwzFLjJeb7BsTsxq9oMr4GFd
callback: jQuery22408664779593893466_1690867219137
_: 1690867219138

*/

// jQuery22408664779593893466_1690867219137(
const peliasResult = {
  geocoding: {
    version: '0.2',
    query: {
      text: '=75 gla',
      parsed_text: {
        fullQuery: '=75 gla',
        number_first: '75',
        regions: ['= gla'],
      },
      tokens: ['=75', 'gla'],
      size: 5,
      lang: {
        name: 'English',
        iso6391: 'en',
        iso6393: 'eng',
        defaulted: false,
      },
    },
    engine: {
      name: 'Pelias',
      version: '1.0',
    },
    timestamp: 1690867248971,
  },
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [145.20477932, -37.97139786],
      },
      properties: {
        id: 'GAVIC423071153',
        layer: 'national_gnaf',
        score: 10.442132,
        name: '55-75 GLADSTONE ROAD, DANDENONG (ST GERARDS PRIMARY SCHOOL)',
        gnaf_pid: 'GAVIC423071153',
        street_locality_pid: 'VIC1971445',
        locality_pid: 'loc642caba35d41',
        number_first: '55',
        number_last: '75',
        street_name: 'GLADSTONE',
        street_suffix: 'ROAD',
        locality: 'DANDENONG',
        postcode: '3175',
        state: 'VIC',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [145.20477932, -37.97139786],
      },
      properties: {
        id: 'GAVIC423661207',
        layer: 'national_gnaf',
        score: 10.440331,
        name: '73-75 GLADSTONE ROAD, DANDENONG',
        gnaf_pid: 'GAVIC423661207',
        street_locality_pid: 'VIC1971445',
        locality_pid: 'loc642caba35d41',
        number_first: '73',
        number_last: '75',
        street_name: 'GLADSTONE',
        street_suffix: 'ROAD',
        locality: 'DANDENONG',
        postcode: '3175',
        state: 'VIC',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [151.14472484, -33.83411812],
      },
      properties: {
        id: 'GANSW704979476',
        layer: 'national_gnaf',
        score: 10.440331,
        name: 'LOT 1, 71-75 GLADESVILLE ROAD, HUNTERS HILL',
        gnaf_pid: 'GANSW704979476',
        street_locality_pid: 'NSW2848508',
        locality_pid: 'loc758474cd1b68',
        number_first: '71',
        number_last: '75',
        lot_number: '1',
        street_name: 'GLADESVILLE',
        street_suffix: 'ROAD',
        locality: 'HUNTERS HILL',
        postcode: '2110',
        state: 'NSW',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [145.20477932, -37.97139786],
      },
      properties: {
        id: 'GAVIC425561237',
        layer: 'national_gnaf',
        score: 10.439127,
        name: '41-75 GLADSTONE ROAD, DANDENONG',
        gnaf_pid: 'GAVIC425561237',
        street_locality_pid: 'VIC1971445',
        locality_pid: 'loc642caba35d41',
        number_first: '41',
        number_last: '75',
        street_name: 'GLADSTONE',
        street_suffix: 'ROAD',
        locality: 'DANDENONG',
        postcode: '3175',
        state: 'VIC',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [138.58195288, -34.9752536],
      },
      properties: {
        id: 'GASA_415390746',
        layer: 'national_gnaf',
        score: 10.133385,
        name: '75 GLADYS STREET, CLARENCE GARDENS',
        gnaf_pid: 'GASA_415390746',
        street_locality_pid: 'SA546305',
        locality_pid: 'loc6b7afd88979a',
        number_first: '75',
        street_name: 'GLADYS',
        street_suffix: 'STREET',
        locality: 'CLARENCE GARDENS',
        postcode: '5039',
        state: 'SA',
      },
    },
  ],
  bbox: [138.58195288, -37.97139786, 151.14472484, -33.83411812],
};
// );
