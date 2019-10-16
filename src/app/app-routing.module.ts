import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PagesComponent } from './catalog/pages/pages.component';

const routes: Routes = [
  {
    path: 'catalog',
    children: [
      {
        path: 'pages',
        component: PagesComponent
      },
      {
        path: '**',
        redirectTo: 'pages'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'catalog'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
