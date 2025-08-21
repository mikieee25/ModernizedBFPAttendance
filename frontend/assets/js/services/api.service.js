/**
 * Service for handling API requests.
 */
export class ApiService {
  constructor() {
    this.baseUrl = config.apiBaseUrl;
  }

  /**
   * Perform an API request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Fetch options
   * @returns {Promise<any>} - Response data
   */
  async request(endpoint, options = {}) {
    try {
      const url = this.baseUrl + endpoint;

      // Set default options
      const defaultOptions = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      };

      // Merge options
      const requestOptions = { ...defaultOptions, ...options };

      // Add auth token if available (but not for auth endpoints that already have a token)
      const token = localStorage.getItem(config.tokenName);
      if (token && !requestOptions.headers.Authorization) {
        requestOptions.headers.Authorization = `Bearer ${token}`;
      }

      // Make request
      const response = await fetch(url, requestOptions);

      // Handle potential non-JSON responses
      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle non-200 responses
      if (!response.ok) {
        // Check for 401 (Unauthorized) to handle token expiration
        if (response.status === 401 && endpoint !== "/auth/refresh") {
          // Try to refresh token
          const refreshSuccess = await this.handleTokenRefresh();
          if (refreshSuccess) {
            // Retry the original request with new token
            return await this.request(endpoint, options);
          } else {
            // Refresh failed, clear auth and throw error
            window.app.events.emit("auth:session-expired");
            throw new Error(
              data.error || "Session expired. Please log in again."
            );
          }
        }

        throw new Error(
          typeof data === "object"
            ? data.error || "API request failed"
            : "API request failed"
        );
      }

      return data;
    } catch (error) {
      console.error(`API request to ${endpoint} failed:`, error);

      // Re-throw for specific handling by calling function
      throw error;
    }
  }

  /**
   * Handle token refresh when a request returns 401
   * @returns {Promise<boolean>} - True if token refreshed successfully
   */
  async handleTokenRefresh() {
    try {
      const refreshToken = localStorage.getItem(config.refreshTokenName);
      if (!refreshToken) {
        return false;
      }

      const url = this.baseUrl + "/auth/refresh";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();

      if (data.success) {
        localStorage.setItem(config.tokenName, data.access_token);
        return true;
      } else {
        throw new Error(data.error || "Token refresh failed");
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      // Clear auth data
      localStorage.removeItem(config.tokenName);
      localStorage.removeItem(config.refreshTokenName);
      return false;
    }
  }

  /**
   * Upload file to API
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - Form data with files
   * @param {function} progressCallback - Progress callback
   * @returns {Promise<any>} - Response data
   */
  async uploadFile(endpoint, formData, progressCallback = null) {
    try {
      const url = this.baseUrl + endpoint;

      // Set up request options
      const requestOptions = {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
        body: formData,
      };

      // Add auth token if available
      const token = localStorage.getItem(config.tokenName);
      if (token) {
        requestOptions.headers.Authorization = `Bearer ${token}`;
      }

      // Use XMLHttpRequest for progress tracking
      if (progressCallback) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.open("POST", url);

          // Set headers
          xhr.setRequestHeader("Accept", "application/json");
          if (token) {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          }

          // Set up progress tracking
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round(
                (event.loaded / event.total) * 100
              );
              progressCallback(percentComplete);
            }
          };

          // Handle response
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                resolve(data);
              } catch (error) {
                resolve(xhr.responseText);
              }
            } else {
              reject(
                new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`)
              );
            }
          };

          // Handle errors
          xhr.onerror = () => reject(new Error("Network error during upload"));

          // Start upload
          xhr.send(formData);
        });
      } else {
        // Use regular fetch if no progress tracking needed
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "File upload failed");
        }

        return await response.json();
      }
    } catch (error) {
      console.error(`File upload to ${endpoint} failed:`, error);
      throw error;
    }
  }
}
