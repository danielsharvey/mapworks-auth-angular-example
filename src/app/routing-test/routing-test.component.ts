import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  template: `
    <div style="display: flex; flex-direction: column; gap: 4px;">
      <div>
        Routing Test
        <a [routerLink]="['']">Home</a> |
        <a [routerLink]="['one']">./one</a> |
        <a [routerLink]="['two']">./two</a> |
        <a [routerLink]="['a/b/c']">./a/b/c</a> |
        <a [routerLink]="['specific-route']">./specific-route</a>
      </div>
      <div>
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
})
export class RoutingTestComponent {}
