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
            this.messages.push({ content: `Error during file conversion: ${error.message}`, sent: false, isImage: false });
          });
        } else if(file.type.match(/pdf.*/)) {
          console.log("PDF HERE");
          this.fileToBase64(file).then(base64 => {
            const fileName = file.name;
            this.isTyping = true;
            this.openAIService.sendFile(fileName, base64).subscribe((response: any) => {
              this.pollForTaskCompletion(response.task_id); // Poll for task completion
            })
            this.messages.push({ content: "Processing file...please check back in a bit", sent: true, isImage: false });
            // ...
          })
          .catch(error => {
            console.error("Error during file conversion: ", error);
            this.messages.push({ content: `Error during file conversion: ${error.message}`, sent: false, isImage: false });
          });
        }
        else {
          console.log("File selected is not an image");
          this.messages.push({ content: `File selected is not an image or PDF`, sent: false, isImage: false });
        }
      });
    }
  }

  pollForTaskCompletion(taskId: string) {
    const interval = setInterval(() => {
      this.openAIService.checkTaskStatus(taskId).subscribe((taskResponse: any) => {
        if (taskResponse.status === 'success') {
          clearInterval(interval);
          this.handlePDF(taskResponse.result); // Handle the PDF processing result
          this.isTyping = false;
        } else if (taskResponse.status === 'failure') {
          clearInterval(interval);
          console.error("Error processing file: ", taskResponse.error);
          this.messages.push({ content: `Error processing file: ${taskResponse.error}`, sent: false, isImage: false });
          this.isTyping = false;
        }
        // Optionally handle 'pending' status
      }, error => {
        clearInterval(interval);
        console.error("Error checking task status: ", error);
        this.messages.push({ content: `Error checking task status: ${error.error}`, sent: false, isImage: false });
        this.isTyping = false;
      });
    }, 5000); // Poll every 3 seconds
  }

  handlePDF(response: any) {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const desiredHeight = 50; // Set the desired height for the logo
    const aspectRatio = 1920 / 1080; // Aspect ratio of the original image
    const desiredWidth = desiredHeight * aspectRatio;
    const logoMargin = 15; // Margin from top and left
    const textMargin = 15; // Margin for the text

    // Calculate the Y position for the start of the text, adjust as necessary
    // Here, we assume the logo's bottom edge is at `logoMargin + desiredHeight`
    // and we add a small margin of 10 units below the logo
    const textStartY = logoMargin + desiredHeight + 10;

    // Optionally add a round logo in the top-left corner
    // The logo should be pre-cropped to a circle with a transparent background
    const logoData = '../assets/circleOwl.png'; // Path to the logo image
    pdf.addImage(logoData, 'PNG', logoMargin, logoMargin, desiredWidth, desiredHeight);

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
    let y = textStartY + lineHeight; // Adjusted Y position for the body text

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
