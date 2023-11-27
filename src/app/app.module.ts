import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { DataService } from './service/data.service';
import { RouterModule } from '@angular/router';
import { ChatComponent } from './chat-component/chat-component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        AppComponent,
        ChatComponent
        // ... other declarations
      ],
    imports: [
    // other imports ...
        BrowserModule,
        HttpClientModule,
        RouterModule,
        AppRoutingModule,
        FormsModule
    ],
    providers: [HttpClientModule,  DataService],
    bootstrap: [AppComponent]
  // declarations, providers, bootstrap...
})
export class AppModule { }
