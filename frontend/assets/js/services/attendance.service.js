/**
 * Service for handling attendance-related operations.
 */
import { ApiService } from "./api.service.js";

export class AttendanceService {
  constructor() {
    this.api = new ApiService();
  }

  /**
   * Get all attendance records
   * @param {object} params - Query parameters (date range, personnel ID, etc.)
   * @returns {Promise<object>} - Response with attendance list
   */
  async getAttendanceRecords(params = {}) {
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

      return await this.api.request(`/attendance${queryString}`);
    } catch (error) {
      console.error("Failed to get attendance records:", error);
      window.app.events.emit("error:attendance", {
        message: "Failed to get attendance records",
      });
      throw error;
    }
  }

  /**
   * Get attendance record by ID
   * @param {number} id - Attendance record ID
   * @returns {Promise<object>} - Response with attendance data
   */
  async getAttendanceById(id) {
    try {
      return await this.api.request(`/attendance/${id}`);
    } catch (error) {
      console.error(`Failed to get attendance record with ID ${id}:`, error);
      window.app.events.emit("error:attendance", {
        message: `Failed to get attendance record with ID ${id}`,
      });
      throw error;
    }
  }

  /**
   * Get attendance records for a specific personnel
   * @param {number} personnelId - Personnel ID
   * @param {object} params - Query parameters (date range, etc.)
   * @returns {Promise<object>} - Response with attendance list
   */
  async getPersonnelAttendance(personnelId, params = {}) {
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

      return await this.api.request(
        `/personnel/${personnelId}/attendance${queryString}`
      );
    } catch (error) {
      console.error(
        `Failed to get attendance for personnel with ID ${personnelId}:`,
        error
      );
      window.app.events.emit("error:attendance", {
        message: `Failed to get attendance for personnel`,
      });
      throw error;
    }
  }

  /**
   * Record attendance
   * @param {object} attendanceData - Attendance data
   * @returns {Promise<object>} - Response with created attendance
   */
  async recordAttendance(attendanceData) {
    try {
      const response = await this.api.request("/attendance", {
        method: "POST",
        body: JSON.stringify(attendanceData),
      });

      window.app.events.emit("attendance:recorded", response.attendance);
      return response;
    } catch (error) {
      console.error("Failed to record attendance:", error);
      window.app.events.emit("error:attendance", {
        message: "Failed to record attendance",
      });
      throw error;
    }
  }

  /**
   * Record attendance with face recognition
   * @param {Blob} imageBlob - Image blob from webcam
   * @returns {Promise<object>} - Response with created attendance
   */
  async recordAttendanceWithFace(imageBlob) {
    try {
      const formData = new FormData();
      formData.append("image", imageBlob, "face.jpg");

      const response = await this.api.uploadFile(
        "/attendance/face-recognition",
        formData
      );

      window.app.events.emit("attendance:recorded", response.attendance);
      return response;
    } catch (error) {
      console.error(
        "Failed to record attendance with face recognition:",
        error
      );
      window.app.events.emit("error:attendance", {
        message: "Failed to record attendance with face recognition",
      });
      throw error;
    }
  }

  /**
   * Update attendance record
   * @param {number} id - Attendance record ID
   * @param {object} attendanceData - Updated attendance data
   * @returns {Promise<object>} - Response with updated attendance
   */
  async updateAttendance(id, attendanceData) {
    try {
      const response = await this.api.request(`/attendance/${id}`, {
        method: "PUT",
        body: JSON.stringify(attendanceData),
      });

      window.app.events.emit("attendance:updated", response.attendance);
      return response;
    } catch (error) {
      console.error(`Failed to update attendance record with ID ${id}:`, error);
      window.app.events.emit("error:attendance", {
        message: `Failed to update attendance record`,
      });
      throw error;
    }
  }

  /**
   * Delete attendance record
   * @param {number} id - Attendance record ID
   * @returns {Promise<object>} - Response with success status
   */
  async deleteAttendance(id) {
    try {
      const response = await this.api.request(`/attendance/${id}`, {
        method: "DELETE",
      });

      window.app.events.emit("attendance:deleted", { id });
      return response;
    } catch (error) {
      console.error(`Failed to delete attendance record with ID ${id}:`, error);
      window.app.events.emit("error:attendance", {
        message: `Failed to delete attendance record`,
      });
      throw error;
    }
  }

  /**
   * Generate attendance report
   * @param {object} params - Report parameters (date range, format, etc.)
   * @returns {Promise<object>} - Response with report URL or data
   */
  async generateReport(params = {}) {
    try {
      // For PDF/CSV reports that return a file
      if (
        params.format &&
        ["pdf", "csv", "excel"].includes(params.format.toLowerCase())
      ) {
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

        // Get file as blob
        const url = this.api.baseUrl + `/attendance/report${queryString}`;
        const token = localStorage.getItem(config.tokenName);

        const response = await fetch(url, {
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to generate report");
        }

        // Create download link
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);

        // Return download URL
        return {
          success: true,
          downloadUrl,
          format: params.format,
        };
      } else {
        // For JSON data reports
        return await this.api.request("/attendance/report", {
          method: "POST",
          body: JSON.stringify(params),
        });
      }
    } catch (error) {
      console.error("Failed to generate attendance report:", error);
      window.app.events.emit("error:attendance", {
        message: "Failed to generate attendance report",
      });
      throw error;
    }
  }

  /**
   * Get attendance statistics
   * @param {object} params - Query parameters (date range, etc.)
   * @returns {Promise<object>} - Response with statistics
   */
  async getStatistics(params = {}) {
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

      return await this.api.request(`/attendance/statistics${queryString}`);
    } catch (error) {
      console.error("Failed to get attendance statistics:", error);
      window.app.events.emit("error:attendance", {
        message: "Failed to get attendance statistics",
      });
      throw error;
    }
  }
}
