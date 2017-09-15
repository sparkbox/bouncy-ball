import {
  OnInit,
  Component,
} from '@angular/core';

@Component({
  selector: `app-root`,
  template: `
    <bouncy-ball [status]="status"></bouncy-ball>
    `,
})

export class AppComponent implements OnInit {
  //title = 'ARE YOU NOT ENTERTAINED?!?!?!?!';
  status: String = 'down';
  delay = 1150;

  ngOnInit() {
    //start the party by making the initial call to the recursive function switch()
    this.switch(this.status = 'down');
  }

  switch(status: String) {
    // angular 2 hates infinite while loops but it doesn't seem to mind this recursive function 
    // best practice yet to be determined
    //
    // transition appears to get called whenever one or more data-bound input properties change (like ngOnChanges())
    // so we'll create this component, give it a data-bound input property, and
    // run a simple loop in our main component to change this property
    //https://angular.io/docs/ts/latest/guide/lifecycle-hooks.html
    this.sleep(this.delay).then(() => {
      if (this.status == 'down') {
        return this.switch(this.status = 'up');
      } else {
        return this.switch(this.status = 'down');
      }
    });
  }

  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
}