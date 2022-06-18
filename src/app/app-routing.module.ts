import { PaymentComponent } from './home/payment/payment.component';
import { MyTripsComponent } from './home/my-trips/my-trips.component';
import { SearchTicketComponent } from './home/search-ticket/search-ticket.component';
import { PassengerDetailComponent } from './home/passenger-detail/passenger-detail.component';
import { HomeComponent } from './home/home.component';
import { ReportComponent } from './main/report/report.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { TripDetailComponent } from './main/trip-detail/trip-detail.component';
import { TripListComponent } from './main/trip-list/trip-list.component';
import { TripOperationComponent } from './main/trip-operation/trip-operation.component';
import { BusCrudComponent } from './main/bus-crud/bus-crud.component';
import { EmployeeAccountComponent } from './main/employee-account/employee-account.component';
import { EntryComponent } from './main/entry/entry.component';
import { LoginComponent } from './login/login.component';
import { DrawerComponent } from './main/view-admin-account/drawer/drawer.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ViewAdminAccountComponent } from './main/view-admin-account/view-admin-account.component';
import { CreateAdminComponent } from './main/create-admin/create-admin.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { PlaceCrudComponent } from './main/place-crud/place-crud.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    component: HomeComponent,
    children: [
      { path: '', redirectTo: 'search_ticket', pathMatch: 'full' },
      { path: 'search_ticket', component: SearchTicketComponent },
      { path: 'my_trips', component: MyTripsComponent },
      { path: 'passenger_detail/:key', component: PassengerDetailComponent },
      { path: 'payment_methods', component: PaymentComponent },
    ],
  },
  { path: 'login', component: LoginComponent },
  { path: 'reset_password', component: ResetPasswordComponent },
  {
    path: 'main',
    component: MainComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'entry' },
      { path: 'entry', component: EntryComponent },
      // admin routings
      { path: 'create_Admin_Account', component: CreateAdminComponent },
      { path: 'view_Admin_Account', component: ViewAdminAccountComponent },
      { path: 'view_Admin_Account/:id', component: DrawerComponent },
      { path: 'update_Admin_Account/:id', component: CreateAdminComponent },
      // employee routing
      { path: 'employee_CRUD', component: EmployeeAccountComponent },
      { path: 'bus_CRUD', component: BusCrudComponent },
      { path: 'destination_CRUD', component: PlaceCrudComponent },
      { path: 'trip/planning', component: TripOperationComponent },
      { path: 'trip/list', component: TripListComponent },
      { path: ':id/trip/detail', component: TripDetailComponent },
      { path: 'report', component: ReportComponent },
    ],
  },
  // todo uncomment bottom routes
  // { path: '**', redirectTo: 'page_not_found' },
  // { path: 'page_not_found', component: PageNotFoundComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
