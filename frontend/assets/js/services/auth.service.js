/**
 * Authentication service for the application.
 */
import { ApiService } from "./api.service.js";

export class AuthService {
  constructor() {
    this.api = new ApiService();
    this.currentUser = null;
    this.tokenRefreshInterval = null;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem(config.tokenName);
  }

  /**
   * Get current user data
   * @returns {object|null} - Current user or null
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check authentication status and refresh if needed
   */
  async checkAuth() {
    try {
      // Check if we have a token
      const token = localStorage.getItem(config.tokenName);
      if (!token) {
        return false;
      }

      // Verify token validity (can be improved with JWT decode to check expiration)
      try {
        // Try to get user data to verify token
        await this.getUserData();

        // Set up token refresh
        this.setupTokenRefresh();

        return true;
      } catch (error) {
        // Token invalid, try to refresh
        return await this.refreshToken();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      this.logout();
      return false;
    }
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {object} - Login result
   */
  async login(email, password) {
    try {
      const response = await this.api.request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response.success) {
        // Save tokens
        localStorage.setItem(config.tokenName, response.access_token);
        localStorage.setItem(config.refreshTokenName, response.refresh_token);

        // Save user data
        this.currentUser = response.user;

        // Set up token refresh
        this.setupTokenRefresh();

        // Emit login event
        window.app.events.emit("auth:login", response.user);

        return response;
      } else {
        throw new Error(response.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      window.app.events.emit("error:auth", { message: error.message });
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      // Only call API if we have a token
      if (this.isAuthenticated()) {
        await this.api.request("/auth/logout", {
          method: "POST",
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clean up regardless of API success
      this.clearAuthData();
      window.app.events.emit("auth:logout");
    }
  }

  /**
   * Refresh authentication token
   * @returns {boolean} - True if token refreshed successfully
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem(config.refreshTokenName);
      if (!refreshToken) {
        return false;
      }

      const response = await this.api.request("/auth/refresh", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (response.success) {
        localStorage.setItem(config.tokenName, response.access_token);

        // Get user data with new token
        await this.getUserData();

        return true;
      } else {
        throw new Error(response.error || "Token refresh failed");
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      this.clearAuthData();
      return false;
    }
  }

  /**
   * Get user data
   */
  async getUserData() {
    try {
      const response = await this.api.request("/auth/me", {
        method: "GET",
      });

      if (response.success) {
        this.currentUser = response.user;
        return response.user;
      } else {
        throw new Error(response.error || "Failed to get user data");
      }
    } catch (error) {
      console.error("Get user data error:", error);
      throw error;
    }
  }

  /**
   * Set up token refresh interval
   */
  setupTokenRefresh() {
    // Clear any existing interval
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
    }

    // Set up new interval
    this.tokenRefreshInterval = setInterval(async () => {
      await this.refreshToken();
    }, config.tokenRefreshInterval);
  }

  /**
   * Clear all authentication data
   */
  clearAuthData() {
    localStorage.removeItem(config.tokenName);
    localStorage.removeItem(config.refreshTokenName);
    this.currentUser = null;

    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
      this.tokenRefreshInterval = null;
    }
  }
}
