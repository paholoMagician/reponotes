import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './shared/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

const routes: Routes = [

  { path: 'home', component:  DashboardComponent},
  { path: 'login', component:  LoginComponent},
  { path: '**', pathMatch: 'full', redirectTo: 'login' }

];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
