import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './routing/app-routing/app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { NavComponent } from './nav/nav.component';
import { MzCheckboxModule } from 'ngx-materialize';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LoaderComponent } from './loader/loader.component';
import { MzModalModule } from 'ngx-materialize';
import { FilterlistPipe } from './pipes/filterlist.pipe';
import { MzTabModule } from 'ngx-materialize';
import { MzToastModule } from 'ngx-materialize';
import { MzSidenavModule } from 'ngx-materialize';
import { GooglePlacesDirective } from './main/google-places.directive';
import { FilterRatesPipe } from './pipes/filterrates.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginmodalComponent } from './loginmodal/loginmodal.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ProgressComponent } from './progress/progress.component';
import { LoginmodalboxComponent } from './loginmodal/loginmodalbox/loginmodalbox.component';
import { UserpanelComponent } from './userpanel/userpanel.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    NavComponent,
    LoaderComponent,
    FilterlistPipe,
    GooglePlacesDirective,
    FilterRatesPipe,
    LoginmodalComponent,
    DashboardComponent,
    ProgressComponent,
    LoginmodalboxComponent,
    UserpanelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MzCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MzModalModule,
    MzTabModule,
    MzToastModule,
    BrowserAnimationsModule,
    MzSidenavModule
  ],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent],
  entryComponents: [LoginmodalboxComponent]
})
export class AppModule {}
