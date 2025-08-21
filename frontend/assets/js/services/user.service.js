/**
 * Service for handling user management operations.
 */
import { ApiService } from "./api.service.js";

export class UserService {
  constructor() {
    this.api = new ApiService();
  }

  /**
   * Get all users
   * @param {object} params - Query parameters
   * @returns {Promise<object>} - Response with users list
   */
  async getAllUsers(params = {}) {
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString()
        ? `?${queryParams.toString()}`
        : "";

      return await this.api.request(`/users${queryString}`);
    } catch (error) {
      console.error("Failed to get users:", error);
      window.app.events.emit("error:user", { message: "Failed to get users" });
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise<object>} - Response with user data
   */
  async getUserById(id) {
    try {
      return await this.api.request(`/users/${id}`);
    } catch (error) {
      console.error(`Failed to get user with ID ${id}:`, error);
      window.app.events.emit("error:user", {
        message: `Failed to get user with ID ${id}`,
      });
      throw error;
    }
  }

  /**
   * Create new user
   * @param {object} userData - User data
   * @returns {Promise<object>} - Response with created user
   */
  async createUser(userData) {
    try {
      const response = await this.api.request("/users", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      window.app.events.emit("user:created", response.user);
      return response;
    } catch (error) {
      console.error("Failed to create user:", error);
      window.app.events.emit("error:user", {
        message: "Failed to create user",
      });
      throw error;
    }
  }

  /**
   * Update user
   * @param {number} id - User ID
   * @param {object} userData - Updated user data
   * @returns {Promise<object>} - Response with updated user
   */
  async updateUser(id, userData) {
    try {
      const response = await this.api.request(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      });

      window.app.events.emit("user:updated", response.user);
      return response;
    } catch (error) {
      console.error(`Failed to update user with ID ${id}:`, error);
      window.app.events.emit("error:user", {
        message: `Failed to update user with ID ${id}`,
      });
      throw error;
    }
  }

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise<object>} - Response with success status
   */
  async deleteUser(id) {
    try {
      const response = await this.api.request(`/users/${id}`, {
        method: "DELETE",
      });

      window.app.events.emit("user:deleted", { id });
      return response;
    } catch (error) {
      console.error(`Failed to delete user with ID ${id}:`, error);
      window.app.events.emit("error:user", {
        message: `Failed to delete user with ID ${id}`,
      });
      throw error;
    }
  }

  /**
   * Change user password
   * @param {number} id - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<object>} - Response with success status
   */
  async changePassword(id, currentPassword, newPassword) {
    try {
      const response = await this.api.request(`/users/${id}/password`, {
        method: "PUT",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      window.app.events.emit("user:password-changed", { id });
      return response;
    } catch (error) {
      console.error(`Failed to change password for user with ID ${id}:`, error);
      window.app.events.emit("error:user", {
        message: "Failed to change password",
      });
      throw error;
    }
  }

  /**
   * Reset user password (admin only)
   * @param {number} id - User ID
   * @param {string} newPassword - New password
   * @returns {Promise<object>} - Response with success status
   */
  async resetPassword(id, newPassword) {
    try {
      const response = await this.api.request(`/users/${id}/reset-password`, {
        method: "PUT",
        body: JSON.stringify({
          new_password: newPassword,
        }),
      });

      window.app.events.emit("user:password-reset", { id });
      return response;
    } catch (error) {
      console.error(`Failed to reset password for user with ID ${id}:`, error);
      window.app.events.emit("error:user", {
        message: "Failed to reset password",
      });
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {object} profileData - Profile data
   * @returns {Promise<object>} - Response with updated profile
   */
  async updateProfile(profileData) {
    try {
      const response = await this.api.request("/users/profile", {
        method: "PUT",
        body: JSON.stringify(profileData),
      });

      window.app.events.emit("user:profile-updated", response.user);
      return response;
    } catch (error) {
      console.error("Failed to update profile:", error);
      window.app.events.emit("error:user", {
        message: "Failed to update profile",
      });
      throw error;
    }
  }

  /**
   * Upload user avatar
   * @param {File} file - Avatar file
   * @param {function} progressCallback - Progress callback
   * @returns {Promise<object>} - Response with updated user
   */
  async uploadAvatar(file, progressCallback = null) {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await this.api.uploadFile(
        "/users/avatar",
        formData,
        progressCallback
      );

      window.app.events.emit("user:avatar-updated", {
        avatarUrl: response.avatar_url,
      });

      return response;
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      window.app.events.emit("error:user", {
        message: "Failed to upload avatar",
      });
      throw error;
    }
  }

  /**
   * Get activity logs for a user
   * @param {number} id - User ID
   * @param {object} params - Query parameters
   * @returns {Promise<object>} - Response with activity logs
   */
  async getUserActivityLogs(id, params = {}) {
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString()
        ? `?${queryParams.toString()}`
        : "";

      return await this.api.request(`/users/${id}/activity-logs${queryString}`);
    } catch (error) {
      console.error(
        `Failed to get activity logs for user with ID ${id}:`,
        error
      );
      window.app.events.emit("error:user", {
        message: "Failed to get activity logs",
      });
      throw error;
    }
  }
}
