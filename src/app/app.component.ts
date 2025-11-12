import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from './api.service';
import { FooterComponent } from './footer/footer.component';

interface Model {
  id: string;
  // We can add more properties here (like object, created, owned_by) if needed
}

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [CommonModule, FormsModule, FooterComponent], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'OpenAI Chat Frontend';
  
  // Configuration inputs
  apiUrl: string = ''; 
  apiKey: string = ''; 
  
  // Model state
  availableModels: Model[] = [];
  selectedModel: string = 'DeepSeek-R1-Distill-Qwen-14B-W4A16'; // Default value from original request
  
  // Chat state
  userInput: string = '';
  responseContent: string = 'Enter the API URL, Key, and fetch models to start the conversation...';
  
  // UI states
  isLoading: boolean = false;
  isModelListLoading: boolean = false;
  
  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // We won't auto-fetch on init because we need the key first, 
    // so we'll rely on the manual button click.
  }
  
  // New method to fetch models
  fetchModels(): void {
    if (!this.apiKey.trim() || !this.apiUrl.trim()) {
      this.responseContent = 'Please enter both the API URL and your API-Key to fetch models.';
      return;
    }
    
    this.isModelListLoading = true;
    this.responseContent = 'Fetching models...';
    
    this.apiService.getModels(this.apiKey, this.apiUrl).subscribe({
      next: (response: any) => {
        // Assuming the standard OpenAI model list format: { data: [{id: 'model-name', ...}, ...] }
        if (response && Array.isArray(response.data)) {
          this.availableModels = response.data.map((item: any) => ({ id: item.id }));
          
          // Try to set the selectedModel to the original default, otherwise select the first model
          if (this.availableModels.length > 0) {
            this.selectedModel = this.availableModels[0].id;
            
          }
          this.responseContent = `Successfully loaded ${this.availableModels.length} models. Select one and send a message.`;
        } else {
          this.responseContent = 'Successfully connected but failed to parse model list. Response was: ' + JSON.stringify(response);
          this.availableModels = [];
        }
      },
      error: (error) => {
        console.error('Model Fetch API Error:', error);
        this.responseContent = `Failed to fetch models: ${error.statusText}. Please check the API Key and URL.`;
        this.availableModels = [];
      },
      complete: () => {
        this.isModelListLoading = false;
      }
    });
  }

  sendMessage(): void {
    // ✋ Check for all required fields
    if (!this.userInput.trim() || !this.apiKey.trim() || !this.apiUrl.trim() || !this.selectedModel.trim()) {
      this.responseContent = 'Please ensure the API is configured (URL, Key, and a selected Model) and your message is not empty.';
      return; 
    }

    this.isLoading = true;
    const messageToSend = this.userInput;

    // ➡️ Pass the selectedModel to the service method
    this.apiService.sendMessage(messageToSend, this.apiKey, this.apiUrl, this.selectedModel).subscribe({
      next: (response: any) => {
        try {
          this.responseContent = response.choices[0].message.content;
          this.userInput = ''; // Clear user input on success
        } catch (e) {
          this.responseContent = 'Error parsing chat response. Check console.';
          console.error(e);
        }
      },
      error: (error) => {
        console.error('Chat API Error:', error);
        if (error.status === 401) {
             this.responseContent = 'Authentication failed. Please check your API Key.';
        } else {
             this.responseContent = `An error occurred while running chat completion (${error.status}): ${error.message}.`;
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
