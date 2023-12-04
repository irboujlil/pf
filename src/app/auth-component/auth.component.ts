import { Component } from '@angular/core';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  email: string = '';
  password: string = '';
  isLoginMode: boolean = true;

  constructor(private authService: AuthService) {}

  async onSubmit() {
    if (this.isLoginMode) {
      await this.authService.signIn(this.email, this.password);
    } else {
      await this.authService.signUp(this.email, this.password);
    }
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }
}


