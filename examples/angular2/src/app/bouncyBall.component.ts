import {
    Component,
    Input,
    trigger,
    state,
    style,
    transition,
    animate,
} from '@angular/core';

@Component({
    selector: `bouncy-ball`,
    styles: [`
      .circle {
        display: block;
        position: absolute;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: red;
        top: 168px;
      }
    `],
    template: `
    <div [@bounce]="status" class="circle"></div>
    `,
    animations: [
        trigger('bounce', [
            transition('* => *', [animate(575, style({ top: '0px' })), animate('575ms ease-in')])
        ]),
    ]
})

export class bouncyBallComponent {
    // transition appears to get called whenever one or more data-bound input properties change (like ngOnChanges())
    // so we'll create this component, give it a data-bound input property, and
    // run a simple loop in our main component to change this property
    //https://angular.io/docs/ts/latest/guide/lifecycle-hooks.html
    @Input() status;
}