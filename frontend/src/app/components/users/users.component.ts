import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

declare var bootstrap: any;

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  loading = false;
  userForm!: FormGroup;
  userModal: any;
  editMode = false;
  selectedUserId: number | null = null;
  searchTerm = '';

  roles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'lab_technician', label: 'Lab Technician' },
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'doctor', label: 'Doctor' }
  ];

  constructor(
    private apiService: ApiService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.initForm();
    this.loadUsers();
  }

  initForm() {
    this.userForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
      full_name: ['', Validators.required],
      phone: [''],
      is_active: [true]
    });
  }

  loadUsers() {
    this.loading = true;
    this.apiService.getUsers().subscribe({
      next: (response) => {
        this.users = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
        alert('Failed to load users');
      }
    });
  }

  openModal(user?: any) {
    this.editMode = !!user;
    this.selectedUserId = user?.id || null;

    if (user) {
      this.userForm.patchValue({
        username: user.username,
        email: user.email,
        password: '', // Don't populate password
        role: user.role,
        full_name: user.full_name,
        phone: user.phone,
        is_active: user.is_active
      });
      // Make password optional for edit
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    } else {
      this.userForm.reset({ is_active: true });
      // Make password required for new user
      this.userForm.get('password')?.setValidators([Validators.required]);
      this.userForm.get('password')?.updateValueAndValidity();
    }

    this.userModal = new bootstrap.Modal(document.getElementById('userModal'));
    this.userModal.show();
  }

  closeModal() {
    this.userModal.hide();
    this.userForm.reset();
    this.editMode = false;
    this.selectedUserId = null;
  }

  onSubmit() {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formData = this.userForm.value;
    
    // Remove password if empty in edit mode
    if (this.editMode && !formData.password) {
      delete formData.password;
    }

    if (this.editMode && this.selectedUserId) {
      this.apiService.updateUser(this.selectedUserId, formData).subscribe({
        next: () => {
          alert('User updated successfully');
          this.closeModal();
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error updating user:', error);
          alert(error.error?.error || 'Failed to update user');
        }
      });
    } else {
      this.apiService.createUser(formData).subscribe({
        next: () => {
          alert('User created successfully');
          this.closeModal();
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error creating user:', error);
          alert(error.error?.error || 'Failed to create user');
        }
      });
    }
  }

  deleteUser(user: any) {
    if (user.id === 1) {
      alert('Cannot delete the default admin user');
      return;
    }

    if (confirm(`Are you sure you want to deactivate user "${user.username}"?`)) {
      this.apiService.deleteUser(user.id).subscribe({
        next: () => {
          alert('User deactivated successfully');
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Failed to delete user');
        }
      });
    }
  }

  toggleUserStatus(user: any) {
    if (user.id === 1) {
      alert('Cannot deactivate the default admin user');
      return;
    }

    const action = user.is_active ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} user "${user.username}"?`)) {
      this.apiService.toggleUserStatus(user.id).subscribe({
        next: () => {
          alert(`User ${action}d successfully`);
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error toggling user status:', error);
          alert('Failed to update user status');
        }
      });
    }
  }

  getRoleBadgeClass(role: string): string {
    const classes: any = {
      'admin': 'bg-danger',
      'lab_technician': 'bg-primary',
      'receptionist': 'bg-info',
      'doctor': 'bg-success'
    };
    return classes[role] || 'bg-secondary';
  }

  getRoleLabel(role: string): string {
    const labels: any = {
      'admin': 'Administrator',
      'lab_technician': 'Lab Technician',
      'receptionist': 'Receptionist',
      'doctor': 'Doctor'
    };
    return labels[role] || role;
  }

  get filteredUsers() {
    if (!this.searchTerm) {
      return this.users;
    }
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(user =>
      user.username.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.full_name.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  }
}
