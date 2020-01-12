import { UserGuard } from './user.guard';
import { LoginmodalComponent } from './../../loginmodal/loginmodal.component';
import { AuthGuard } from './auth.guard';
import { DashboardComponent } from './../../dashboard/dashboard.component';
import { MainComponent } from './../../main/main.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { UserpanelComponent } from 'src/app/userpanel/userpanel.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: MainComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { path: 'login', component: LoginmodalComponent, canActivate: [AuthGuard] },
  { path: 'userpanel', component: UserpanelComponent, canActivate: [UserGuard] }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
