import { FilteredTripListComponent } from './home/trip-list/trip-list.component';
import { AuthInterceptor } from './services/auth.interceptor.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IconsProviderModule } from './icons-provider-module';
// import { NzLayoutModule } from 'ng-zorro-antd/layout';
// import { NzMenuModule } from 'ng-zorro-antd/menu';
import { ngZorroAntdModule } from './ng-zorro-antd-module';
import { LoginComponent } from './login/login.component';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { MainComponent } from './main/main.component';
import { CreateAdminComponent } from './main/create-admin/create-admin.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { environment } from '../environments/environment';
import { ViewAdminAccountComponent } from './main/view-admin-account/view-admin-account.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { DrawerComponent } from './main/view-admin-account/drawer/drawer.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { EntryComponent } from './main/entry/entry.component';
import { EmployeeAccountComponent } from './main/employee-account/employee-account.component';
import { BusCrudComponent } from './main/bus-crud/bus-crud.component';
import { PlaceCrudComponent } from './main/place-crud/place-crud.component';
import { TripOperationComponent } from './main/trip-operation/trip-operation.component';
import { TripListComponent } from './main/trip-list/trip-list.component';
import { TripDetailComponent } from './main/trip-detail/trip-detail.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ReportComponent } from './main/report/report.component';
import { HomeComponent } from './home/home.component';
import { SearchTicketComponent } from './home/search-ticket/search-ticket.component';
import { PassengerDetailComponent } from './home/passenger-detail/passenger-detail.component';
import { MyTripsComponent } from './home/my-trips/my-trips.component';
import { PaymentComponent } from './home/payment/payment.component';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    LoginComponent,
    CreateAdminComponent,
    ViewAdminAccountComponent,
    PageNotFoundComponent,
    DrawerComponent,
    LoadingSpinnerComponent,
    EntryComponent,
    EmployeeAccountComponent,
    BusCrudComponent,
    PlaceCrudComponent,
    TripOperationComponent,
    TripListComponent,
    TripDetailComponent,
    ResetPasswordComponent,
    ReportComponent,
    HomeComponent,
    SearchTicketComponent,
    PassengerDetailComponent,
    MyTripsComponent,
    FilteredTripListComponent,
    PaymentComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule,
    ngZorroAntdModule,
    IconsProviderModule,
    NzLayoutModule,
    NzMenuModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: NZ_I18N, useValue: en_US },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
