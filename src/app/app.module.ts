import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { DataService } from './service/data.service';
import { RouterModule } from '@angular/router';
import { ChatComponent } from './chat-component/chat-component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { AuthService } from './service/auth.service';
import { AuthComponent } from './auth-component/auth.component';

@NgModule({
    declarations: [
        AppComponent,
        ChatComponent,
        AuthComponent
        // ... other declarations
      ],
    imports: [
    // other imports ...
        BrowserModule,
        HttpClientModule,
        RouterModule,
        AppRoutingModule,
        FormsModule,
        AngularFireModule.initializeApp(environment.firebaseConfig)
    ],
    providers: [HttpClientModule,  DataService, AuthService],
    bootstrap: [AppComponent]
  // declarations, providers, bootstrap...
})
export class AppModule { }
