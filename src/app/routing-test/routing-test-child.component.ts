import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

@Component({
  template: `
    <div>
      This is the child, routed via "{{ path$ | async }}", <br />with data "{{ (data$ | async)?.['type']
      }}"
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
})
export class RoutingTestChildComponent {
  readonly route = inject(ActivatedRoute);

  path$ = this.route.url.pipe(
    map((url) => {
      return url.map((segment) => segment.path).join('/');
    })
  );

  data$ = this.route.data;
}
