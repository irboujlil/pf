import { AngularFireAuth } from '@angular/fire/auth';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<boolean>(false);

  constructor(private afAuth: AngularFireAuth) {
    this.afAuth.authState.subscribe(user => {
      this.authState.next(!!user);
    });
  }

  get isLoggedIn() {
    return this.authState.asObservable();
  }

  async signUp(email: string, password: string) {
    await this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  async signIn(email: string, password: string) {
    await this.afAuth.signInWithEmailAndPassword(email, password);
  }

  async signOut() {
    await this.afAuth.signOut();
    this.authState.next(false);
  }
}


