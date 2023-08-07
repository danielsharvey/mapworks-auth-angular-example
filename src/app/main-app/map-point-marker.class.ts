import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, Inject, Input, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Observable, Subject, filter, switchMap, take, tap, throttleTime } from 'rxjs';
import { MapworksMapService } from '../mapworks-map.service';
import { MapworksFeatureEvent, MapworksMap, MapworksStudio, MapworksTreeLayerEntity, fromEvent } from '../mapworks';

import type * as _ from 'underscore';

/**
 * This is an SVG marker with expanding concentric rings.
 */
const MARKER_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" width="140">
    <symbol id="pulse" viewBox="0 0 16 16">
      <circle  cx="8" cy="8" r="0" fill="#FF6347">
        <animate attributeName="r" values="0;8" keyTimes="0; 1" dur="3s" repeatCount="1" />
        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="3s" repeatCount="1" />
      </circle>
      <circle  cx="8" cy="8" r="0" fill="#FF6347">
        <animate attributeName="r" values="0;8" keyTimes="0; 1" begin="0.75s" dur="3s" repeatCount="1" />
        <animate attributeName="opacity" values="1;0" keyTimes="0;1" begin="0.75s" dur="3s" repeatCount="1" />
      </circle>
      <circle  cx="8" cy="8" r="0" fill="#FF6347">
        <animate attributeName="r" values="0;8" keyTimes="0; 1" begin="1.5s" dur="3s" repeatCount="1" />
        <animate attributeName="opacity" values="1;0" keyTimes="0;1" begin="1.5s" dur="3s" repeatCount="1" />
      </circle>
      <circle  cx="8" cy="8" r="0" fill="#FF6347">
        <animate attributeName="r" values="0;8" keyTimes="0; 1" begin="2.25s" dur="3s" repeatCount="1" />
        <animate attributeName="opacity" values="1;0" keyTimes="0;1" begin="2.25s" dur="3s" repeatCount="1" />
      </circle>
      <circle cx="8" cy="8" r="0.2" fill="black"/>
    </symbol>

    <use href="#pulse" x="0" y="0" width="10" height="10" />
  </svg>
`;

/**
 * A Mapworks FeatureReport to display a marker which highlights a point
 * feature.
 */
export class MapPointMarker {

  /// The compiled Underscore template used as the marker
  private template: _.CompiledTemplate;

  private location: any; // XXX TODO Type

  constructor(
    private Studio: MapworksStudio,
    private map: MapworksMap,
    private featureReporterName = 'app-zoom-to-with-marker',
  ) {
    this.template = Studio._.template(MARKER_SVG);
  }

  private get featureReporter() { // XXX TODO Type
    const that = this;
    let featureReporter = this.map.getControl(this.featureReporterName);
    if(!featureReporter) {
      featureReporter = new (<any>this.Studio).core.control.featureReporter.FeatureReporter({
        name: this.featureReporterName,
        template: this.template,
        offset: {
          // based on the size of the SVG marker
          x: -70,
          y: -70,
        },
        updateEvent: 'navigation:zoom navigation:pan navigation:zoompan navigation:stabilised',
        endEvent: '', // could use 'mouse:click' or other map event
        isEndStopListen: true,
        listenObject: this.map,
        'z-index': 1
      });
      (<any>featureReporter).update = function(e: any) { // XXX TODO Types
        /* the initial marker is in the centre of the map, update if the
         * map pans/zooms whilst marker displayed */
        if(that.location) {
          let px = (<any>that.map).getCoordinates(that.location[0], that.location[1], true);
          this.place(() => px);
        }
      }
      featureReporter.addTo(this.map);
    }
    return featureReporter;
  }

  public placeMarker(location: any) {  // XXX TODO Type
    this.location = location;

    const featureReporter = this.featureReporter as any; // XXX TODO Type
    featureReporter.place();
    featureReporter.start();

    // based on animation time in MARKER_SVG
    const duration = (2.25 + (4+1)*3) * 1000;

    setTimeout(() => {
      console.log('REMOVE MARKER');
      if(this.location === location) {
        featureReporter.stop();
      }
    }, duration);
  }

  public removeMarker() {
    let featureReporter = this.map.getControl(this.featureReporterName) as any; // XXX TODO Type
    if(this.featureReporter) {
      featureReporter.stop();
      featureReporter.clear();
    }
  }

}
