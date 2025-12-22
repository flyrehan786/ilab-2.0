import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  currentUser: any;
  labs: any[] = [];
  selectedLabId: string = '';

  constructor(
    public authService: AuthService, 
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (this.authService.isSuperAdmin()) {
        this.loadLabs();
        this.selectedLabId = localStorage.getItem('selectedLabId') || '';
      }
    });
  }

  loadLabs() {
    this.apiService.getAllLabs().subscribe(labs => {
      this.labs = labs;
    });
  }

  onLabChange() {
    localStorage.setItem('selectedLabId', this.selectedLabId);
    // Reload the current route to apply the filter
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  logout() {
    this.authService.logout();
  }
}
