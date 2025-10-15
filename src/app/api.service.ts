import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  constructor(private http: HttpClient) { }

  // New method to fetch available models
  getModels(apiKey: string, apiUrl: string): Observable<any> {
    const modelsUrl = `${apiUrl}/models`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${apiKey}`, 
      'Content-Type': 'application/json'
    });

    // Use a GET request for the model list endpoint
    return this.http.get(modelsUrl, { headers });
  }

  // Updated sendMessage method: takes selectedModel
  sendMessage(message: string, apiKey: string, apiUrl: string, selectedModel: string): Observable<any> {
    const completionsUrl = `${apiUrl}/v1/chat/completions`

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${apiKey}`, 
      'Content-Type': 'application/json'
    });

    const body = {
      // Use the dynamically selected model
      'model': selectedModel, 
      'messages': [
        { 'role': 'user', 'content': message } 
      ]
    };

    return this.http.post(completionsUrl, body, { headers });
  }
}
