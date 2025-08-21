/**
 * Service for handling personnel-related operations.
 */
import { ApiService } from "./api.service.js";

export class PersonnelService {
  constructor() {
    this.api = new ApiService();
  }

  /**
   * Get all personnel
   * @param {object} params - Query parameters
   * @returns {Promise<object>} - Response with personnel list
   */
  async getAllPersonnel(params = {}) {
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

      return await this.api.request(`/personnel${queryString}`);
    } catch (error) {
      console.error("Failed to get personnel:", error);
      window.app.events.emit("error:personnel", {
        message: "Failed to get personnel",
      });
      throw error;
    }
  }

  /**
   * Get personnel by ID
   * @param {number} id - Personnel ID
   * @returns {Promise<object>} - Response with personnel data
   */
  async getPersonnelById(id) {
    try {
      return await this.api.request(`/personnel/${id}`);
    } catch (error) {
      console.error(`Failed to get personnel with ID ${id}:`, error);
      window.app.events.emit("error:personnel", {
        message: `Failed to get personnel with ID ${id}`,
      });
      throw error;
    }
  }

  /**
   * Create new personnel
   * @param {object} personnelData - Personnel data
   * @returns {Promise<object>} - Response with created personnel
   */
  async createPersonnel(personnelData) {
    try {
      const response = await this.api.request("/personnel", {
        method: "POST",
        body: JSON.stringify(personnelData),
      });

      window.app.events.emit("personnel:created", response.personnel);
      return response;
    } catch (error) {
      console.error("Failed to create personnel:", error);
      window.app.events.emit("error:personnel", {
        message: "Failed to create personnel",
      });
      throw error;
    }
  }

  /**
   * Update personnel
   * @param {number} id - Personnel ID
   * @param {object} personnelData - Updated personnel data
   * @returns {Promise<object>} - Response with updated personnel
   */
  async updatePersonnel(id, personnelData) {
    try {
      const response = await this.api.request(`/personnel/${id}`, {
        method: "PUT",
        body: JSON.stringify(personnelData),
      });

      window.app.events.emit("personnel:updated", response.personnel);
      return response;
    } catch (error) {
      console.error(`Failed to update personnel with ID ${id}:`, error);
      window.app.events.emit("error:personnel", {
        message: `Failed to update personnel with ID ${id}`,
      });
      throw error;
    }
  }

  /**
   * Delete personnel
   * @param {number} id - Personnel ID
   * @returns {Promise<object>} - Response with success status
   */
  async deletePersonnel(id) {
    try {
      const response = await this.api.request(`/personnel/${id}`, {
        method: "DELETE",
      });

      window.app.events.emit("personnel:deleted", { id });
      return response;
    } catch (error) {
      console.error(`Failed to delete personnel with ID ${id}:`, error);
      window.app.events.emit("error:personnel", {
        message: `Failed to delete personnel with ID ${id}`,
      });
      throw error;
    }
  }

  /**
   * Upload personnel photo
   * @param {number} id - Personnel ID
   * @param {File} file - Photo file
   * @param {function} progressCallback - Progress callback
   * @returns {Promise<object>} - Response with updated personnel
   */
  async uploadPersonnelPhoto(id, file, progressCallback = null) {
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await this.api.uploadFile(
        `/personnel/${id}/photo`,
        formData,
        progressCallback
      );

      window.app.events.emit("personnel:photo-updated", {
        id,
        photoUrl: response.photo_url,
      });

      return response;
    } catch (error) {
      console.error(
        `Failed to upload photo for personnel with ID ${id}:`,
        error
      );
      window.app.events.emit("error:personnel", {
        message: `Failed to upload personnel photo`,
      });
      throw error;
    }
  }

  /**
   * Get personnel statistics
   * @returns {Promise<object>} - Response with statistics
   */
  async getStatistics() {
    try {
      return await this.api.request("/personnel/statistics");
    } catch (error) {
      console.error("Failed to get personnel statistics:", error);
      window.app.events.emit("error:personnel", {
        message: "Failed to get personnel statistics",
      });
      throw error;
    }
  }
}
