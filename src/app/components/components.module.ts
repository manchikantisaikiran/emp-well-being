import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';

const components = [
  HeaderComponent
]

@NgModule({
  declarations: [
    ...components
  ],
  imports: [
    CommonModule
  ],
  exports:[
    ...components
  ]
})
export class ComponentsModule { }
