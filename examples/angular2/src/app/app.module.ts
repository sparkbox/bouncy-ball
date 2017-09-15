import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { bouncyBallComponent } from './bouncyBall.component';

@NgModule({
  declarations: [
    AppComponent,
    bouncyBallComponent
  ],
  imports: [
    BrowserModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
