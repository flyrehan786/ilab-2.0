import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-lab',
  templateUrl: './register-lab.component.html',
  styleUrls: ['./register-lab.component.css']
})
export class RegisterLabComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      address: [''],
      phone: [''],
      registration_number: [''],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.authService.registerLab(this.registerForm.value).subscribe(
      () => {
        this.router.navigate(['/login']);
      },
      (error: HttpErrorResponse) => {
        this.errorMessage = error.error.error || 'An unexpected error occurred.';
      }
    );
  }
}
