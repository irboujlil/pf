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
    
    // Set up styles for a modern look
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(40); // Dark gray
    
    // Optionally add a logo in the top-left corner
    
    // The dimensions for the image might need to be adjusted
    pdf.addImage('../assets/owlPhoto.png', 'PNG', 10, 10, 25, 25);
    
    
    // Add a title with some padding and a bottom border
    pdf.text('Critical Points:', 20, 20);
    
    // Reset font for the content
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.setTextColor(0); // Black color
    
    const lineHeight = 1.2 * pdf.getFontSize(); // Line height
    let y = 40; // Y position after the title and line

    // Split the response into lines of a maximum width
    const lines = pdf.splitTextToSize(response, 170); // Assuming a margin of 20 each side

    // Loop through each line and add it to the document
    lines.forEach((line, index) => {
        // Add new page if the content exceeds the page height
        if ((y + lineHeight) > (pdf.internal.pageSize.height - 20)) {
            pdf.addPage();
            y = 20; // Reset Y position to the top for the new page
        }

        pdf.text(line, 20, y);
        y += lineHeight; // Increment Y position for next line
    });

    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Sanitize the blob URL
    const sanitizedUrl = this.sanitizer.bypassSecurityTrustUrl(pdfUrl);

    this.messages.push({
        content: sanitizedUrl,
        sent: false,
        isPdf: true,
        fileName: 'Questions.pdf'
    });

    this.isTyping = false;
  }
  
  

}
