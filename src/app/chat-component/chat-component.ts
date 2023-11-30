import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../service/data.service';
import jsPDF from 'jspdf';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-chat-component',
  //standalone: true,
  //imports: [CommonModule],
  templateUrl: './chat-component.html',
  styleUrls: ['./chat-component.scss']
})
export class ChatComponent {

  message: string = '';
  messages: any[] = [];
  isTyping: boolean = false;
  file: any;

  constructor(private openAIService: DataService, private sanitizer: DomSanitizer) { }

  sendMessage() {
    
    if (this.message.trim()) {
      this.isTyping = true;
      this.messages.push({ content: this.message, sent: true, isImage: false });
      this.openAIService.sendMessage(this.message).subscribe(
        response => {
          console.log('Response from OpenAI:', response);
          this.messages.push({ content: response, sent: false, isImage: false });
          this.isTyping = false;
          // Handle the response here
        },
        error => {
          console.error('Error:', error);
        }
      );
      this.message = ''; // Clear the input
      //this.receiveResponse(); // Simulate receiving a response
    }
  }
  receiveResponse() {
    setTimeout(() => {
      this.messages.push({ content: 'Response Received!', sent: false, isImage: false });
      this.isTyping = false; // Stop typing indicator
    }, 1000); // Simulate response delay
  }

  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      Array.from(inputElement.files).forEach(file => {
        // Process each file here
        if (file.type.match(/image.*/)) {
          this.fileToBase64(file).then(base64 => {
            const fileName = file.name;
            this.isTyping = true;
            // Add each image to the messages array
            this.openAIService.sendFile(fileName, base64).subscribe((response: any) => {
              this.messages.push({ content: response, sent: false, isImage: false });
              //console.log(response)
              this.isTyping = false
            })
            this.messages.push({ content: base64, sent: true, isImage: true });
            // Send each image to the server
            // ...
          }).catch(error => {
            console.error("Error during file conversion: ", error);
          });
        } else if(file.type.match(/pdf.*/)) {
          console.log("PDF HERE");
          this.fileToBase64(file).then(base64 => {
            const fileName = file.name;
            this.isTyping = true;
            // Add each image to the messages array
            this.openAIService.sendFile(fileName, base64).subscribe((response: any) => {
              this.handlePDF(response);
            })
            this.messages.push({ content: "Analyzing file...", sent: true, isImage: false });
            // Send each image to the server
            // ...
          }).catch(error => {
            console.error("Error during file conversion: ", error);
          });
        }
        else {
          console.log("File selected is not an image");
        }
      });
    }
  }

  handlePDF(response: any) {
    const pdf = new jsPDF();
    pdf.text(response, 10, 10);
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Sanitize the blob URL
    const sanitizedUrl = this.sanitizer.bypassSecurityTrustUrl(pdfUrl);

    this.messages.push({
      content: sanitizedUrl,
      sent: false,
      isPdf: true,
      fileName: 'response.pdf'
    });

    this.isTyping = false;
  }
  
  

}
