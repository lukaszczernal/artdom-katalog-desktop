import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesComponent } from './pages/pages.component';
import { PagesService } from './pages/pages.service';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [PagesComponent],
  imports: [
    CommonModule,
    DragDropModule
  ],
  providers: [PagesService]
})
export class CatalogModule { }
