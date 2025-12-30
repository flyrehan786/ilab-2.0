import { Component, Input, Output, EventEmitter, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-searchable-dropdown',
  templateUrl: './searchable-dropdown.component.html',
  styleUrls: ['./searchable-dropdown.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableDropdownComponent),
      multi: true
    }
  ]
})
export class SearchableDropdownComponent implements OnInit, ControlValueAccessor {
  @Input() items: any[] = [];
  @Input() bindLabel: string = 'name';
  @Input() bindValue: string = 'id';
  @Input() placeholder: string = 'Search...';
  @Input() notFoundText: string = 'No items found';
  
  @Output() itemSelected = new EventEmitter<any>();
  
  filteredItems: any[] = [];
  searchText: string = '';
  isOpen: boolean = false;
  selectedItem: any = null;
  highlightedIndex: number = -1;
  
  private onChange: any = () => {};
  private onTouched: any = () => {};
  
  constructor() { }
  
  ngOnInit() {
    this.filteredItems = [...this.items];
  }
  
  writeValue(value: any): void {
    if (value !== undefined && value !== null) {
      this.selectedItem = this.items.find(item => item[this.bindValue] === value);
    }
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  onSearchChange(searchText: string) {
    this.searchText = searchText;
    if (!searchText) {
      this.filteredItems = [...this.items];
    } else {
      const searchLower = searchText.toLowerCase();
      this.filteredItems = this.items.filter(item => 
        item[this.bindLabel].toLowerCase().includes(searchLower)
      );
    }
    // Reset the highlighted index when search changes
    this.highlightedIndex = -1;
  }
  
  onKeyDown(event: KeyboardEvent) {
    if (!this.isOpen) {
      this.isOpen = true;
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex = 
          this.highlightedIndex < this.filteredItems.length - 1 
            ? this.highlightedIndex + 1 
            : this.highlightedIndex;
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex = 
          this.highlightedIndex > 0 
            ? this.highlightedIndex - 1 
            : -1;
        break;
        
      case 'Enter':
        event.preventDefault();
        if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredItems.length) {
          this.selectItem(this.filteredItems[this.highlightedIndex]);
        } else if (this.filteredItems.length === 1) {
          // If there's only one item, select it on enter
          this.selectItem(this.filteredItems[0]);
        }
        break;
        
      case 'Escape':
        this.isOpen = false;
        this.highlightedIndex = -1;
        break;
    }
  }
  
  selectItem(item: any) {
    this.selectedItem = item;
    this.isOpen = false;
    this.searchText = '';
    this.onChange(item[this.bindValue]);
    this.itemSelected.emit(item);
  }
  
  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.filteredItems = [...this.items];
    }
  }
  
  onBlur() {
    // Small delay to allow click events to be processed
    setTimeout(() => {
      this.isOpen = false;
      this.searchText = '';
      this.onTouched();
    }, 200);
  }
}
