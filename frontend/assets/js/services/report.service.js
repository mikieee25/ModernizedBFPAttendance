/**
 * Service for handling report generation and management.
 */
import { ApiService } from "./api.service.js";

export class ReportService {
  constructor() {
    this.api = new ApiService();
  }

  /**
   * Generate attendance report
   * @param {object} params - Report parameters
   * @returns {Promise<object>} - Response with report data or download URL
   */
  async generateAttendanceReport(params = {}) {
    try {
      // For file formats that return a download
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
        const url = this.api.baseUrl + `/reports/attendance${queryString}`;
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

        // Generate filename
        let filename = `attendance_report_${
          new Date().toISOString().split("T")[0]
        }`;

        // Add extension based on format
        switch (params.format.toLowerCase()) {
          case "pdf":
            filename += ".pdf";
            break;
          case "csv":
            filename += ".csv";
            break;
          case "excel":
            filename += ".xlsx";
            break;
        }

        // Return download URL and filename
        return {
          success: true,
          downloadUrl,
          filename,
          format: params.format,
        };
      } else {
        // For JSON data reports
        return await this.api.request("/reports/attendance", {
          method: "POST",
          body: JSON.stringify(params),
        });
      }
    } catch (error) {
      console.error("Failed to generate attendance report:", error);
      window.app.events.emit("error:report", {
        message: "Failed to generate attendance report",
      });
      throw error;
    }
  }

  /**
   * Generate personnel report
   * @param {object} params - Report parameters
   * @returns {Promise<object>} - Response with report data or download URL
   */
  async generatePersonnelReport(params = {}) {
    try {
      // For file formats that return a download
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
        const url = this.api.baseUrl + `/reports/personnel${queryString}`;
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

        // Generate filename
        let filename = `personnel_report_${
          new Date().toISOString().split("T")[0]
        }`;

        // Add extension based on format
        switch (params.format.toLowerCase()) {
          case "pdf":
            filename += ".pdf";
            break;
          case "csv":
            filename += ".csv";
            break;
          case "excel":
            filename += ".xlsx";
            break;
        }

        // Return download URL and filename
        return {
          success: true,
          downloadUrl,
          filename,
          format: params.format,
        };
      } else {
        // For JSON data reports
        return await this.api.request("/reports/personnel", {
          method: "POST",
          body: JSON.stringify(params),
        });
      }
    } catch (error) {
      console.error("Failed to generate personnel report:", error);
      window.app.events.emit("error:report", {
        message: "Failed to generate personnel report",
      });
      throw error;
    }
  }

  /**
   * Generate system activity report
   * @param {object} params - Report parameters
   * @returns {Promise<object>} - Response with report data or download URL
   */
  async generateActivityReport(params = {}) {
    try {
      // For file formats that return a download
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
        const url = this.api.baseUrl + `/reports/activity${queryString}`;
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

        // Generate filename
        let filename = `activity_report_${
          new Date().toISOString().split("T")[0]
        }`;

        // Add extension based on format
        switch (params.format.toLowerCase()) {
          case "pdf":
            filename += ".pdf";
            break;
          case "csv":
            filename += ".csv";
            break;
          case "excel":
            filename += ".xlsx";
            break;
        }

        // Return download URL and filename
        return {
          success: true,
          downloadUrl,
          filename,
          format: params.format,
        };
      } else {
        // For JSON data reports
        return await this.api.request("/reports/activity", {
          method: "POST",
          body: JSON.stringify(params),
        });
      }
    } catch (error) {
      console.error("Failed to generate activity report:", error);
      window.app.events.emit("error:report", {
        message: "Failed to generate activity report",
      });
      throw error;
    }
  }

  /**
   * Download report file
   * @param {string} downloadUrl - Blob URL for the report
   * @param {string} filename - Filename for the download
   */
  downloadReport(downloadUrl, filename) {
    try {
      // Create temporary link
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);

      // Trigger download
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);

      return true;
    } catch (error) {
      console.error("Failed to download report:", error);
      window.app.events.emit("error:report", {
        message: "Failed to download report",
      });
      return false;
    }
  }

  /**
   * Get available report templates
   * @returns {Promise<object>} - Response with templates list
   */
  async getReportTemplates() {
    try {
      return await this.api.request("/reports/templates");
    } catch (error) {
      console.error("Failed to get report templates:", error);
      window.app.events.emit("error:report", {
        message: "Failed to get report templates",
      });
      throw error;
    }
  }

  /**
   * Schedule report generation
   * @param {object} scheduleData - Schedule data
   * @returns {Promise<object>} - Response with schedule information
   */
  async scheduleReport(scheduleData) {
    try {
      const response = await this.api.request("/reports/schedule", {
        method: "POST",
        body: JSON.stringify(scheduleData),
      });

      window.app.events.emit("report:scheduled", response.schedule);
      return response;
    } catch (error) {
      console.error("Failed to schedule report:", error);
      window.app.events.emit("error:report", {
        message: "Failed to schedule report",
      });
      throw error;
    }
  }

  /**
   * Get scheduled reports
   * @returns {Promise<object>} - Response with scheduled reports
   */
  async getScheduledReports() {
    try {
      return await this.api.request("/reports/schedule");
    } catch (error) {
      console.error("Failed to get scheduled reports:", error);
      window.app.events.emit("error:report", {
        message: "Failed to get scheduled reports",
      });
      throw error;
    }
  }

  /**
   * Delete scheduled report
   * @param {number} id - Schedule ID
   * @returns {Promise<object>} - Response with success status
   */
  async deleteScheduledReport(id) {
    try {
      const response = await this.api.request(`/reports/schedule/${id}`, {
        method: "DELETE",
      });

      window.app.events.emit("report:schedule-deleted", { id });
      return response;
    } catch (error) {
      console.error(`Failed to delete scheduled report with ID ${id}:`, error);
      window.app.events.emit("error:report", {
        message: "Failed to delete scheduled report",
      });
      throw error;
    }
  }
}
