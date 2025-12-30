import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchableDropdownComponent } from './components/searchable-dropdown/searchable-dropdown.component';

@NgModule({
  declarations: [
    SearchableDropdownComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    SearchableDropdownComponent
  ]
})
export class SharedModule { }
