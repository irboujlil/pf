import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatComponent } from './chat-component/chat-component';


const routes: Routes = [
  { path: 'chat', component: ChatComponent },
  { path: '', redirectTo: '/chat', pathMatch: 'full' },
  // Define other routes here
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
