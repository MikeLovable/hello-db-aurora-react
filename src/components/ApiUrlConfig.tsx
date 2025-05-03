
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ApiService } from '@/services/ApiService';

const ApiUrlConfig = () => {
  const [backendUrl, setBackendUrl] = useState<string>('');
  const [invokedUrl, setInvokedUrl] = useState<string>('LOCAL');
  const [useApiService, setUseApiService] = useState<boolean>(false);
  
  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const savedUrl = localStorage.getItem('backendUrl') || '';
    const savedUseApi = localStorage.getItem('useApiService') === 'true';
    
    setBackendUrl(savedUrl);
    setUseApiService(savedUseApi);
    
    // Initialize the ApiService with the saved settings
    ApiService.setApiMode(savedUseApi);
    if (savedUrl) {
      ApiService.setBaseUrl(savedUrl);
    }
  }, []);

  const handleAccept = () => {
    // Validate URL format
    if (useApiService && (!backendUrl || !backendUrl.startsWith('http'))) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }
    
    // Save settings to localStorage
    localStorage.setItem('backendUrl', backendUrl);
    localStorage.setItem('useApiService', String(useApiService));
    
    // Update the API service configuration
    ApiService.setBaseUrl(backendUrl);
    ApiService.setApiMode(useApiService);
    
    // Reset the invoked URL if using local mode
    if (!useApiService) {
      setInvokedUrl('LOCAL');
    }
    
    toast.success('API settings updated successfully');
  };

  const handleToggleChange = (checked: boolean) => {
    setUseApiService(checked);
    if (!checked) {
      setInvokedUrl('LOCAL');
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-4 p-4 border border-slate-200 rounded-md bg-slate-50">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <Label htmlFor="backendUrl" className="text-sm font-medium mb-1 block">Backend URL</Label>
          <Input
            id="backendUrl"
            placeholder="https://your-api-gateway-url.amazonaws.com"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            disabled={!useApiService}
          />
        </div>
        
        <div>
          <Button onClick={handleAccept}>Accept</Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="local-or-api" 
            checked={useApiService}
            onCheckedChange={handleToggleChange}
          />
          <Label htmlFor="local-or-api">
            {useApiService ? 'API Mode' : 'Local Mode'}
          </Label>
        </div>
      </div>
      
      <div>
        <Label className="text-sm font-medium mb-1 block">Invoked URL</Label>
        <div className="p-2 bg-slate-100 border border-slate-200 rounded text-sm font-mono break-all">
          {invokedUrl}
        </div>
      </div>
    </div>
  );
};

// Export a singleton instance for global access to update the invoked URL
export const ApiUrlDisplay = {
  updateInvokedUrl: (url: string) => {
    // Find and update the displayed URL in any component that renders ApiUrlConfig
    const event = new CustomEvent('api-url-invoked', { detail: url });
    window.dispatchEvent(event);
  }
};

// Listen for URL update events
if (typeof window !== 'undefined') {
  window.addEventListener('api-url-invoked', ((event: CustomEvent) => {
    const urlDisplayElement = document.querySelector('[data-invoked-url-display]');
    if (urlDisplayElement) {
      urlDisplayElement.textContent = event.detail;
    }
  }) as EventListener);
}

export default ApiUrlConfig;
