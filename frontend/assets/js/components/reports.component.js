/**
 * Reports Component
 * Displays attendance reports and statistics
 */
export class ReportsComponent {
  /**
   * Create a new ReportsComponent
   * @param {Object} options - Component options
   */
  constructor(options = {}) {
    this.options = {
      outlet: null,
      params: {},
      ...options,
    };

    this.outlet = this.options.outlet;
    this.reportType = "daily";
    this.chartInstances = {};
    this.reportData = null;
    this.dateRangeStart = this.getDefaultStartDate();
    this.dateRangeEnd = this.getFormattedDate(new Date());
    this.personnelId = null;
    this.personnelList = [];

    this.initialize();
  }

  /**
   * Initialize the component
   */
  async initialize() {
    try {
      // Show loading state
      window.app.ui.showLoading();

      // Load personnel list
      this.personnelList =
        await window.app.services.personnel.getAllPersonnel();

      // Render the component
      this.render();

      // Attach event listeners
      this.attachEventListeners();

      // Load initial report
      await this.loadReport();

      // Hide loading
      window.app.ui.hideLoading();
    } catch (error) {
      console.error("Error initializing reports:", error);
      window.app.ui.showNotification("Failed to load reports", "error");
      window.app.ui.hideLoading();
    }
  }

  /**
   * Render the component
   */
  render() {
    const html = `
      <div class="reports-page fade-in">
        <div class="mb-6">
          <h1 class="text-2xl font-bold mb-2">Attendance Reports</h1>
          <p class="text-gray-600">View and analyze attendance data</p>
        </div>
        
        <!-- Report Controls -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Report Type -->
            <div>
              <label class="block text-gray-700 text-sm font-medium mb-1">Report Type</label>
              <select id="report-type" class="form-control">
                <option value="daily" ${
                  this.reportType === "daily" ? "selected" : ""
                }>Daily Report</option>
                <option value="weekly" ${
                  this.reportType === "weekly" ? "selected" : ""
                }>Weekly Report</option>
                <option value="monthly" ${
                  this.reportType === "monthly" ? "selected" : ""
                }>Monthly Report</option>
                <option value="custom" ${
                  this.reportType === "custom" ? "selected" : ""
                }>Custom Range</option>
              </select>
            </div>
            
            <!-- Date Range (Start) -->
            <div>
              <label class="block text-gray-700 text-sm font-medium mb-1">Start Date</label>
              <input type="date" id="date-range-start" class="form-control" value="${
                this.dateRangeStart
              }">
            </div>
            
            <!-- Date Range (End) -->
            <div>
              <label class="block text-gray-700 text-sm font-medium mb-1">End Date</label>
              <input type="date" id="date-range-end" class="form-control" value="${
                this.dateRangeEnd
              }">
            </div>
            
            <!-- Personnel Filter -->
            <div>
              <label class="block text-gray-700 text-sm font-medium mb-1">Personnel</label>
              <select id="personnel-filter" class="form-control">
                <option value="">All Personnel</option>
                ${this.personnelList
                  .map(
                    (person) =>
                      `<option value="${person.id}" ${
                        this.personnelId === person.id ? "selected" : ""
                      }>${person.last_name}, ${person.first_name}</option>`
                  )
                  .join("")}
              </select>
            </div>
          </div>
          
          <div class="flex justify-end mt-4">
            <button id="generate-report-btn" class="btn btn-primary">
              <i class="fas fa-sync-alt mr-2"></i> Generate Report
            </button>
            <button id="export-report-btn" class="btn btn-outline ml-2">
              <i class="fas fa-file-export mr-2"></i> Export
            </button>
            <button id="print-report-btn" class="btn btn-outline ml-2">
              <i class="fas fa-print mr-2"></i> Print
            </button>
          </div>
        </div>
        
        <!-- Report Content -->
        <div id="report-content" class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div id="report-loading" class="py-8 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
            <p class="mt-4 text-gray-700">Loading report data...</p>
          </div>
          
          <div id="report-data" class="hidden">
            <!-- Report Header -->
            <div class="mb-6">
              <h2 id="report-title" class="text-xl font-semibold mb-2">Daily Attendance Report</h2>
              <p id="report-date-range" class="text-gray-600">Date Range: 2025-08-14 to 2025-08-21</p>
            </div>
            
            <!-- Report Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 class="text-sm font-medium text-blue-800 mb-1">Total Records</h3>
                <p id="total-records" class="text-2xl font-bold text-blue-600">0</p>
              </div>
              
              <div class="bg-green-50 rounded-lg p-4 border border-green-100">
                <h3 class="text-sm font-medium text-green-800 mb-1">On Time</h3>
                <p id="on-time-count" class="text-2xl font-bold text-green-600">0</p>
              </div>
              
              <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                <h3 class="text-sm font-medium text-yellow-800 mb-1">Late</h3>
                <p id="late-count" class="text-2xl font-bold text-yellow-600">0</p>
              </div>
              
              <div class="bg-red-50 rounded-lg p-4 border border-red-100">
                <h3 class="text-sm font-medium text-red-800 mb-1">Absent</h3>
                <p id="absent-count" class="text-2xl font-bold text-red-600">0</p>
              </div>
            </div>
            
            <!-- Charts Row -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <!-- Attendance Trend Chart -->
              <div>
                <h3 class="text-lg font-medium mb-3">Attendance Trend</h3>
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <canvas id="attendance-trend-chart" height="250"></canvas>
                </div>
              </div>
              
              <!-- Attendance Status Chart -->
              <div>
                <h3 class="text-lg font-medium mb-3">Attendance Status</h3>
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <canvas id="attendance-status-chart" height="250"></canvas>
                </div>
              </div>
            </div>
            
            <!-- Attendance Records Table -->
            <div>
              <h3 class="text-lg font-medium mb-3">Attendance Records</h3>
              <div class="overflow-x-auto">
                <table class="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr>
                      <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personnel</th>
                      <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time In</th>
                      <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Out</th>
                      <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
                    </tr>
                  </thead>
                  <tbody id="attendance-records-table">
                    <tr>
                      <td class="py-3 px-4 border-b border-gray-200 text-sm" colspan="6">No records found</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <!-- No Data Message -->
          <div id="no-data-message" class="py-8 text-center hidden">
            <i class="fas fa-file-alt text-gray-400 text-5xl mb-4"></i>
            <h3 class="text-lg font-medium text-gray-700">No Data Available</h3>
            <p class="text-gray-500 mt-2">No attendance records found for the selected criteria.</p>
          </div>
        </div>
      </div>
    `;

    this.outlet.innerHTML = html;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Report type change
    const reportType = document.getElementById("report-type");
    if (reportType) {
      reportType.addEventListener("change", () => {
        this.reportType = reportType.value;
        this.updateDateRangeVisibility();

        // Update date range based on report type
        if (this.reportType !== "custom") {
          this.updateDateRangeByReportType();
        }
      });
    }

    // Date range inputs
    const dateRangeStart = document.getElementById("date-range-start");
    const dateRangeEnd = document.getElementById("date-range-end");

    if (dateRangeStart) {
      dateRangeStart.addEventListener("change", () => {
        this.dateRangeStart = dateRangeStart.value;
      });
    }

    if (dateRangeEnd) {
      dateRangeEnd.addEventListener("change", () => {
        this.dateRangeEnd = dateRangeEnd.value;
      });
    }

    // Personnel filter
    const personnelFilter = document.getElementById("personnel-filter");
    if (personnelFilter) {
      personnelFilter.addEventListener("change", () => {
        this.personnelId = personnelFilter.value;
      });
    }

    // Generate report button
    const generateReportBtn = document.getElementById("generate-report-btn");
    if (generateReportBtn) {
      generateReportBtn.addEventListener("click", () => this.loadReport());
    }

    // Export report button
    const exportReportBtn = document.getElementById("export-report-btn");
    if (exportReportBtn) {
      exportReportBtn.addEventListener("click", () => this.exportReport());
    }

    // Print report button
    const printReportBtn = document.getElementById("print-report-btn");
    if (printReportBtn) {
      printReportBtn.addEventListener("click", () => this.printReport());
    }

    // Update date range visibility
    this.updateDateRangeVisibility();
  }

  /**
   * Update date range visibility based on report type
   */
  updateDateRangeVisibility() {
    const dateRangeStart = document.getElementById("date-range-start");
    const dateRangeEnd = document.getElementById("date-range-end");

    if (this.reportType === "custom") {
      // Show both date inputs for custom range
      if (dateRangeStart) dateRangeStart.disabled = false;
      if (dateRangeEnd) dateRangeEnd.disabled = false;
    } else {
      // For pre-defined ranges, auto-generate the dates
      this.updateDateRangeByReportType();

      // Disable end date for daily reports
      if (dateRangeStart)
        dateRangeStart.disabled = this.reportType !== "custom";
      if (dateRangeEnd) dateRangeEnd.disabled = this.reportType !== "custom";
    }
  }

  /**
   * Update date range based on report type
   */
  updateDateRangeByReportType() {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (this.reportType) {
      case "daily":
        // Just today
        start = today;
        end = today;
        break;

      case "weekly":
        // Current week (last 7 days)
        start = new Date(today);
        start.setDate(today.getDate() - 6);
        end = today;
        break;

      case "monthly":
        // Current month
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = today;
        break;
    }

    // Update date values
    this.dateRangeStart = this.getFormattedDate(start);
    this.dateRangeEnd = this.getFormattedDate(end);

    // Update input fields
    const dateRangeStart = document.getElementById("date-range-start");
    const dateRangeEnd = document.getElementById("date-range-end");

    if (dateRangeStart) dateRangeStart.value = this.dateRangeStart;
    if (dateRangeEnd) dateRangeEnd.value = this.dateRangeEnd;
  }

  /**
   * Get default start date (7 days ago)
   * @returns {string} - Formatted date string
   */
  getDefaultStartDate() {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return this.getFormattedDate(date);
  }

  /**
   * Format date for input fields
   * @param {Date} date - Date to format
   * @returns {string} - Formatted date string (YYYY-MM-DD)
   */
  getFormattedDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Load report data based on current filters
   */
  async loadReport() {
    try {
      // Show loading state
      this.showReportLoading(true);

      // Create filters object
      const filters = {
        start_date: this.dateRangeStart,
        end_date: this.dateRangeEnd,
        personnel_id: this.personnelId || null,
      };

      // Get report data
      this.reportData =
        await window.app.services.attendance.getAttendanceReport(filters);

      // Update report title and date range
      this.updateReportHeader();

      // Check if we have data
      if (
        this.reportData &&
        this.reportData.records &&
        this.reportData.records.length > 0
      ) {
        // Update summary cards
        this.updateSummaryCards();

        // Update charts
        this.updateCharts();

        // Update table
        this.updateAttendanceTable();

        // Show report data
        this.showReportData(true);
        this.showNoDataMessage(false);
      } else {
        // No data available
        this.showReportData(false);
        this.showNoDataMessage(true);
      }

      // Hide loading
      this.showReportLoading(false);
    } catch (error) {
      console.error("Error loading report:", error);
      window.app.ui.showNotification("Failed to load report data", "error");
      this.showReportLoading(false);
      this.showReportData(false);
      this.showNoDataMessage(true);
    }
  }

  /**
   * Update report header with title and date range
   */
  updateReportHeader() {
    // Get elements
    const reportTitle = document.getElementById("report-title");
    const reportDateRange = document.getElementById("report-date-range");

    // Determine report title based on type
    let title = "Attendance Report";
    switch (this.reportType) {
      case "daily":
        title = "Daily Attendance Report";
        break;
      case "weekly":
        title = "Weekly Attendance Report";
        break;
      case "monthly":
        title = "Monthly Attendance Report";
        break;
      case "custom":
        title = "Custom Attendance Report";
        break;
    }

    // Add personnel name if filtering by person
    if (this.personnelId) {
      const personnel = this.personnelList.find(
        (p) => p.id.toString() === this.personnelId.toString()
      );
      if (personnel) {
        title += ` - ${personnel.first_name} ${personnel.last_name}`;
      }
    }

    // Update elements
    if (reportTitle) reportTitle.textContent = title;
    if (reportDateRange) {
      reportDateRange.textContent = `Date Range: ${this.dateRangeStart} to ${this.dateRangeEnd}`;
    }
  }

  /**
   * Update summary cards with report data
   */
  updateSummaryCards() {
    // Get elements
    const totalRecords = document.getElementById("total-records");
    const onTimeCount = document.getElementById("on-time-count");
    const lateCount = document.getElementById("late-count");
    const absentCount = document.getElementById("absent-count");

    // Update counts
    if (totalRecords)
      totalRecords.textContent = this.reportData.summary.total || 0;
    if (onTimeCount)
      onTimeCount.textContent = this.reportData.summary.on_time || 0;
    if (lateCount) lateCount.textContent = this.reportData.summary.late || 0;
    if (absentCount)
      absentCount.textContent = this.reportData.summary.absent || 0;
  }

  /**
   * Update charts with report data
   */
  updateCharts() {
    // Destroy existing charts
    Object.values(this.chartInstances).forEach((chart) => {
      if (chart) chart.destroy();
    });

    // Create attendance trend chart
    this.createAttendanceTrendChart();

    // Create attendance status chart
    this.createAttendanceStatusChart();
  }

  /**
   * Create attendance trend chart
   */
  createAttendanceTrendChart() {
    const ctx = document.getElementById("attendance-trend-chart");
    if (!ctx) return;

    // Prepare data
    const labels = this.reportData.trend.map((item) => item.date);
    const onTimeData = this.reportData.trend.map((item) => item.on_time);
    const lateData = this.reportData.trend.map((item) => item.late);

    this.chartInstances.trend = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "On Time",
            data: onTimeData,
            borderColor: "#10b981", // Green
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            tension: 0.1,
            fill: true,
          },
          {
            label: "Late",
            data: lateData,
            borderColor: "#f59e0b", // Amber
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            tension: 0.1,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
          },
        },
      },
    });
  }

  /**
   * Create attendance status chart
   */
  createAttendanceStatusChart() {
    const ctx = document.getElementById("attendance-status-chart");
    if (!ctx) return;

    // Prepare data
    const data = [
      this.reportData.summary.on_time || 0,
      this.reportData.summary.late || 0,
      this.reportData.summary.absent || 0,
    ];

    this.chartInstances.status = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["On Time", "Late", "Absent"],
        datasets: [
          {
            data,
            backgroundColor: [
              "#10b981", // Green
              "#f59e0b", // Amber
              "#ef4444", // Red
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "right",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }

  /**
   * Update attendance records table
   */
  updateAttendanceTable() {
    const tableBody = document.getElementById("attendance-records-table");
    if (!tableBody) return;

    // Clear table
    tableBody.innerHTML = "";

    // Check if we have records
    if (!this.reportData.records || this.reportData.records.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td class="py-3 px-4 border-b border-gray-200 text-sm" colspan="6">No records found</td>
        </tr>
      `;
      return;
    }

    // Add rows
    this.reportData.records.forEach((record) => {
      // Format times
      const timeIn = record.time_in
        ? new Date(record.time_in).toLocaleTimeString()
        : "-";
      const timeOut = record.time_out
        ? new Date(record.time_out).toLocaleTimeString()
        : "-";
      const date = new Date(record.date).toLocaleDateString();

      // Calculate total hours
      let totalHours = "-";
      if (record.time_in && record.time_out) {
        const timeInDate = new Date(record.time_in);
        const timeOutDate = new Date(record.time_out);
        const diffMs = timeOutDate - timeInDate;
        const diffHrs = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
        totalHours = `${diffHrs} hrs`;
      }

      // Determine status class
      let statusClass = "";
      switch (record.status) {
        case "on_time":
          statusClass = "bg-green-100 text-green-800";
          break;
        case "late":
          statusClass = "bg-yellow-100 text-yellow-800";
          break;
        case "absent":
          statusClass = "bg-red-100 text-red-800";
          break;
      }

      // Format status text
      const statusText = record.status
        .replace("_", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      // Create row
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="py-2 px-4 border-b border-gray-200 text-sm">${date}</td>
        <td class="py-2 px-4 border-b border-gray-200 text-sm">${record.personnel_name}</td>
        <td class="py-2 px-4 border-b border-gray-200 text-sm">${timeIn}</td>
        <td class="py-2 px-4 border-b border-gray-200 text-sm">${timeOut}</td>
        <td class="py-2 px-4 border-b border-gray-200 text-sm">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
            ${statusText}
          </span>
        </td>
        <td class="py-2 px-4 border-b border-gray-200 text-sm">${totalHours}</td>
      `;

      tableBody.appendChild(row);
    });
  }

  /**
   * Export report to CSV
   */
  exportReport() {
    try {
      if (
        !this.reportData ||
        !this.reportData.records ||
        this.reportData.records.length === 0
      ) {
        window.app.ui.showNotification("No data to export", "warning");
        return;
      }

      // Create CSV content
      let csv = "Date,Personnel,Time In,Time Out,Status,Total Hours\n";

      this.reportData.records.forEach((record) => {
        // Format times
        const date = new Date(record.date).toLocaleDateString();
        const timeIn = record.time_in
          ? new Date(record.time_in).toLocaleTimeString()
          : "-";
        const timeOut = record.time_out
          ? new Date(record.time_out).toLocaleTimeString()
          : "-";

        // Calculate total hours
        let totalHours = "-";
        if (record.time_in && record.time_out) {
          const timeInDate = new Date(record.time_in);
          const timeOutDate = new Date(record.time_out);
          const diffMs = timeOutDate - timeInDate;
          const diffHrs = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
          totalHours = `${diffHrs}`;
        }

        // Format status text
        const statusText = record.status
          .replace("_", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        // Add row to CSV
        csv += `${date},"${record.personnel_name}",${timeIn},${timeOut},${statusText},${totalHours}\n`;
      });

      // Create download link
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `attendance_report_${this.dateRangeStart}_to_${this.dateRangeEnd}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.app.ui.showNotification("Report exported successfully", "success");
    } catch (error) {
      console.error("Error exporting report:", error);
      window.app.ui.showNotification("Failed to export report", "error");
    }
  }

  /**
   * Print the report
   */
  printReport() {
    try {
      if (
        !this.reportData ||
        !this.reportData.records ||
        this.reportData.records.length === 0
      ) {
        window.app.ui.showNotification("No data to print", "warning");
        return;
      }

      // Open print dialog
      window.print();
    } catch (error) {
      console.error("Error printing report:", error);
      window.app.ui.showNotification("Failed to print report", "error");
    }
  }

  /**
   * Show/hide report loading state
   * @param {boolean} show - Whether to show or hide loading
   */
  showReportLoading(show) {
    const reportLoading = document.getElementById("report-loading");
    if (reportLoading) {
      reportLoading.classList.toggle("hidden", !show);
    }
  }

  /**
   * Show/hide report data
   * @param {boolean} show - Whether to show or hide data
   */
  showReportData(show) {
    const reportData = document.getElementById("report-data");
    if (reportData) {
      reportData.classList.toggle("hidden", !show);
    }
  }

  /**
   * Show/hide no data message
   * @param {boolean} show - Whether to show or hide message
   */
  showNoDataMessage(show) {
    const noDataMessage = document.getElementById("no-data-message");
    if (noDataMessage) {
      noDataMessage.classList.toggle("hidden", !show);
    }
  }

  /**
   * Clean up component resources
   */
  destroy() {
    // Destroy chart instances
    Object.values(this.chartInstances).forEach((chart) => {
      if (chart) chart.destroy();
    });
  }
}
