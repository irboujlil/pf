import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  getData() {
    return this.http.get('https://pocket-pf-backend-988d2f637df6.herokuapp.com/api/data'); // Adjust the endpoint as needed
  }

  sendMessage(message: any) {
    //console.log(message);
    return this.http.post('https://pocket-pf-backend-988d2f637df6.herokuapp.com/api/assist', {"prompt": message});
  }

  sendPDF(file: any) {
    //console.log(file);
    return this.http.post('https://pocket-pf-backend-988d2f637df6.herokuapp.com/api/upload-pdf', {"file": file});
  }

  sendFile(base64: string, filename: string) {
    //console.log(file);
    const body = { filename: base64, filedata: filename };
    return this.http.post('http://127.0.0.1:5000/api/image', body);
  }

  checkTaskStatus(taskId: string) {
    console.log(taskId);
    return this.http.get<any>(`http://127.0.0.1:5000/api/task/${taskId}`)
  }
}
