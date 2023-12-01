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
    const pageWidth = pdf.internal.pageSize.getWidth();
    const logoSize = 100; // Size of the logo
    const logoMargin = 15; // Margin from top and left
    const textMargin = 20; // Margin for the text
    const textStartY = logoMargin + logoSize + 10; // Start Y position for text, adjusted for logo

    // Optionally add a round logo in the top-left corner
    // The logo should be pre-cropped to a circle with a transparent background
    const logoData = '../assets/circleOwl.png'; // Replace with actual base64 data of the logo
    pdf.addImage(logoData, 'PNG', logoMargin, logoMargin, logoSize, logoSize);

    // Set up styles for a modern look
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(40); // Dark gray

    // Add a title with some padding below the logo
    pdf.text('Critical Points:', logoMargin, textStartY);

    // Reset font for the content
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.setTextColor(0); // Black color

    // Define maximum width for text based on page width and margins
    const maxWidth = pageWidth - (textMargin * 2);
    const lineHeight = 1.2 * pdf.getFontSize(); // Line height
    let y = textStartY + 10; // Initial Y position for the body, adjusted below the title

    // Split the response into lines of a maximum width
    const lines = pdf.splitTextToSize(response, maxWidth);

    // Loop through each line and add it to the document
    lines.forEach((line) => {
        // Add new page if the content exceeds the page height
        if ((y + lineHeight) > (pdf.internal.pageSize.height - textMargin)) {
            pdf.addPage();
            y = textMargin; // Reset Y position to the top for the new page
        }

        pdf.text(line, textMargin, y);
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
