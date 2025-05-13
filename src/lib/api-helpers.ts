import * as Sentry from "@sentry/nextjs";
import Cookies from "js-cookie";

export async function fetchWithSentry<T>(
  url: string, 
  options: RequestInit = {},
  context: string = "api_request"
): Promise<T> {
  // Create a simple way to track performance without using advanced API
  const startTime = performance.now();
  const requestId = Math.random().toString(36).substring(2, 10);
  
  try {
    // Add authorization token if available
    const token = Cookies.get("accessToken");
    if (token && !options.headers?.hasOwnProperty("Authorization")) {
      options.headers = {
        ...options.headers,
        "Authorization": `Bearer ${token}`,
      };
    }

    // Set content type if not provided and we have a body
    if (options.body && !options.headers?.hasOwnProperty("Content-Type")) {
      options.headers = {
        ...options.headers,
        "Content-Type": "application/json",
      };
    }

    // Add breadcrumb for the request start
    Sentry.addBreadcrumb({
      category: 'fetch',
      message: `${options.method || 'GET'} ${url}`,
      level: 'info',
      data: {
        requestId,
        url,
        method: options.method || 'GET',
        startTime
      }
    });

    const response = await fetch(url, options);
    const endTime = performance.now();
    const duration = endTime - startTime;
      
    // Add breadcrumb for the response
    Sentry.addBreadcrumb({
      category: 'fetch',
      message: `Response: ${response.status} ${response.statusText}`,
      level: response.ok ? 'info' : 'warning',
      data: {
        requestId,
        url,
        status: response.status,
        statusText: response.statusText,
        duration: `${duration.toFixed(2)}ms`
      }
    });
    
    if (!response.ok) {
      // Handle API errors
      const errorData = await response.json().catch(() => ({}));
      
      // Create custom error
      const apiError = new Error(
        errorData.message || `API error: ${response.status} ${response.statusText}`
      );
      
      // Add context to the error
      Sentry.withScope(scope => {
        scope.setExtra("url", url);
        scope.setExtra("status", response.status);
        scope.setExtra("statusText", response.statusText);
        scope.setExtra("response", errorData);
        scope.setExtra("duration", duration);
        scope.setExtra("requestId", requestId);
        scope.setLevel(response.status >= 500 ? "error" : "warning");
        
        Sentry.captureException(apiError);
      });
      
      throw apiError;
    }
    
    // Process successful response
    const data = await response.json();

    // Optionally track successful API calls for performance monitoring
    if (duration > 1000) { // Only track slow requests
      Sentry.captureMessage(`Slow API call to ${url} (${duration.toFixed(2)}ms)`, "warning");
    }

    return data as T;
  } catch (error) {
    // Capture unexpected fetch errors (network failures, etc.)
    Sentry.withScope(scope => {
      scope.setExtra("url", url);
      scope.setExtra("method", options.method || 'GET');
      scope.setExtra("requestId", requestId);
      Sentry.captureException(error);
    });
    throw error;
  }
}
