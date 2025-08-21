/**
 * Dashboard component for main application view
 */
class DashboardComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.authService = window.app.services.auth;
    this.attendanceService = window.app.services.attendance;
    this.personnelService = window.app.services.personnel;
    this.faceRecognitionService = window.app.services.faceRecognition;
    this.notificationService = window.app.services.notification;

    // Component state
    this.state = {
      loading: true,
      attendanceStats: null,
      personnelStats: null,
      recentAttendance: [],
      dateRange: "week", // 'day', 'week', 'month'
    };

    // Initialize component
    this.initialize();
  }

  /**
   * Initialize component
   */
  async initialize() {
    try {
      // Render dashboard
      this.render();

      // Load data
      await this.loadData();

      // Attach event listeners
      this.attachEventListeners();

      // Initialize charts
      this.initCharts();
    } catch (error) {
      console.error("Failed to initialize dashboard component:", error);
      this.notificationService.error("Failed to load dashboard data");
    }
  }

  /**
   * Render dashboard
   */
  render() {
    const template = `
      <div class="dashboard-container">
        <div class="dashboard-header">
          <h1 class="dashboard-title">Dashboard</h1>
          <div class="dashboard-controls">
            <div class="date-range-selector">
              <button class="btn btn-sm ${
                this.state.dateRange === "day" ? "btn-primary" : "btn-outline"
              }" data-range="day">Today</button>
              <button class="btn btn-sm ${
                this.state.dateRange === "week" ? "btn-primary" : "btn-outline"
              }" data-range="week">This Week</button>
              <button class="btn btn-sm ${
                this.state.dateRange === "month" ? "btn-primary" : "btn-outline"
              }" data-range="month">This Month</button>
            </div>
            <button class="btn btn-sm btn-outline btn-refresh">
              <i class="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
        </div>
        
        <div class="dashboard-stats">
          <div class="stats-grid">
            <!-- Attendance Stats -->
            <div class="stat-card" id="present-card">
              <div class="stat-icon">
                <i class="fas fa-user-check"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-title">Present Today</h3>
                <div class="stat-value">
                  <span class="skeleton-loader" id="present-value">0</span>
                </div>
              </div>
            </div>
            
            <div class="stat-card" id="absent-card">
              <div class="stat-icon">
                <i class="fas fa-user-times"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-title">Absent Today</h3>
                <div class="stat-value">
                  <span class="skeleton-loader" id="absent-value">0</span>
                </div>
              </div>
            </div>
            
            <div class="stat-card" id="late-card">
              <div class="stat-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-title">Late Arrivals</h3>
                <div class="stat-value">
                  <span class="skeleton-loader" id="late-value">0</span>
                </div>
              </div>
            </div>
            
            <div class="stat-card" id="personnel-card">
              <div class="stat-icon">
                <i class="fas fa-users"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-title">Total Personnel</h3>
                <div class="stat-value">
                  <span class="skeleton-loader" id="personnel-value">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="dashboard-content">
          <div class="dashboard-row">
            <div class="dashboard-column column-2-3">
              <div class="dashboard-card">
                <div class="card-header">
                  <h2 class="card-title">Attendance Overview</h2>
                </div>
                <div class="card-body">
                  <div class="chart-container">
                    <canvas id="attendance-chart"></canvas>
                    <div class="chart-loading" id="chart-loader">
                      <div class="spinner"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="dashboard-column column-1-3">
              <div class="dashboard-card">
                <div class="card-header">
                  <h2 class="card-title">Personnel Status</h2>
                </div>
                <div class="card-body">
                  <div class="chart-container">
                    <canvas id="personnel-chart"></canvas>
                    <div class="chart-loading" id="personnel-chart-loader">
                      <div class="spinner"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="dashboard-row">
            <div class="dashboard-column column-full">
              <div class="dashboard-card">
                <div class="card-header">
                  <h2 class="card-title">Recent Attendance</h2>
                  <a href="#/attendance" class="card-link">View All</a>
                </div>
                <div class="card-body">
                  <div class="table-responsive">
                    <table class="table table-striped">
                      <thead>
                        <tr>
                          <th>Personnel</th>
                          <th>ID Number</th>
                          <th>Time In</th>
                          <th>Time Out</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody id="recent-attendance-body">
                        <tr class="skeleton-row">
                          <td><div class="skeleton-loader"></div></td>
                          <td><div class="skeleton-loader"></div></td>
                          <td><div class="skeleton-loader"></div></td>
                          <td><div class="skeleton-loader"></div></td>
                          <td><div class="skeleton-loader"></div></td>
                        </tr>
                        <tr class="skeleton-row">
                          <td><div class="skeleton-loader"></div></td>
                          <td><div class="skeleton-loader"></div></td>
                          <td><div class="skeleton-loader"></div></td>
                          <td><div class="skeleton-loader"></div></td>
                          <td><div class="skeleton-loader"></div></td>
                        </tr>
                        <tr class="skeleton-row">
                          <td><div class="skeleton-loader"></div></td>
                          <td><div class="skeleton-loader"></div></td>
                          <td><div class="skeleton-loader"></div></td>
                          <td><div class="skeleton-loader"></div></td>
                          <td><div class="skeleton-loader"></div></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Set container content
    this.container.innerHTML = template;

    // Get DOM elements
    this.dateRangeButtons = this.container.querySelectorAll(
      ".date-range-selector button"
    );
    this.refreshButton = this.container.querySelector(".btn-refresh");
    this.recentAttendanceBody = document.getElementById(
      "recent-attendance-body"
    );
    this.chartLoader = document.getElementById("chart-loader");
    this.personnelChartLoader = document.getElementById(
      "personnel-chart-loader"
    );

    // Stats values
    this.presentValue = document.getElementById("present-value");
    this.absentValue = document.getElementById("absent-value");
    this.lateValue = document.getElementById("late-value");
    this.personnelValue = document.getElementById("personnel-value");
  }

  /**
   * Load dashboard data
   */
  async loadData() {
    try {
      this.setState({ loading: true });

      // Get attendance statistics
      const attendanceParams = { range: this.state.dateRange };
      const attendanceStats = await this.attendanceService.getStatistics(
        attendanceParams
      );

      // Get personnel statistics
      const personnelStats = await this.personnelService.getStatistics();

      // Get recent attendance
      const recentAttendance =
        await this.attendanceService.getAttendanceRecords({
          limit: 5,
          sort: "created_at",
          order: "desc",
        });

      // Update state
      this.setState({
        loading: false,
        attendanceStats: attendanceStats.data,
        personnelStats: personnelStats.data,
        recentAttendance: recentAttendance.data,
      });

      // Update UI
      this.updateStatsUI();
      this.updateRecentAttendanceUI();
      this.updateCharts();
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      this.notificationService.error("Failed to load dashboard data");
      this.setState({ loading: false });
    }
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Date range selector
    this.dateRangeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const range = button.dataset.range;
        this.setState({ dateRange: range });

        // Update active button
        this.dateRangeButtons.forEach((btn) => {
          btn.classList.toggle("btn-primary", btn.dataset.range === range);
          btn.classList.toggle("btn-outline", btn.dataset.range !== range);
        });

        // Reload data
        this.loadData();
      });
    });

    // Refresh button
    this.refreshButton.addEventListener("click", () => {
      this.loadData();
    });
  }

  /**
   * Initialize charts
   */
  initCharts() {
    // Initialize attendance chart (empty for now)
    this.attendanceChart = new Chart(
      document.getElementById("attendance-chart"),
      {
        type: "bar",
        data: {
          labels: [],
          datasets: [],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: false,
            },
          },
        },
      }
    );

    // Initialize personnel chart (empty for now)
    this.personnelChart = new Chart(
      document.getElementById("personnel-chart"),
      {
        type: "doughnut",
        data: {
          labels: [],
          datasets: [],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
            },
            title: {
              display: false,
            },
          },
        },
      }
    );
  }

  /**
   * Update charts with data
   */
  updateCharts() {
    if (!this.state.attendanceStats || !this.state.personnelStats) {
      return;
    }

    // Hide loaders
    this.chartLoader.style.display = "none";
    this.personnelChartLoader.style.display = "none";

    // Update attendance chart
    const attendanceData = this.state.attendanceStats;
    const labels = attendanceData.dates || [];

    this.attendanceChart.data.labels = labels;
    this.attendanceChart.data.datasets = [
      {
        label: "Present",
        data: attendanceData.present || [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Late",
        data: attendanceData.late || [],
        backgroundColor: "rgba(255, 159, 64, 0.6)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
      },
      {
        label: "Absent",
        data: attendanceData.absent || [],
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ];
    this.attendanceChart.update();

    // Update personnel chart
    const personnelData = this.state.personnelStats;

    this.personnelChart.data.labels = ["Active", "Inactive"];
    this.personnelChart.data.datasets = [
      {
        label: "Personnel Status",
        data: [personnelData.active || 0, personnelData.inactive || 0],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(201, 203, 207, 0.6)",
        ],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(201, 203, 207, 1)"],
        borderWidth: 1,
      },
    ];
    this.personnelChart.update();
  }

  /**
   * Update statistics UI
   */
  updateStatsUI() {
    if (!this.state.attendanceStats || !this.state.personnelStats) {
      return;
    }

    // Remove skeleton loaders
    this.presentValue.classList.remove("skeleton-loader");
    this.absentValue.classList.remove("skeleton-loader");
    this.lateValue.classList.remove("skeleton-loader");
    this.personnelValue.classList.remove("skeleton-loader");

    // Update values
    this.presentValue.textContent =
      this.state.attendanceStats.today_present || 0;
    this.absentValue.textContent = this.state.attendanceStats.today_absent || 0;
    this.lateValue.textContent = this.state.attendanceStats.today_late || 0;
    this.personnelValue.textContent = this.state.personnelStats.total || 0;
  }

  /**
   * Update recent attendance table
   */
  updateRecentAttendanceUI() {
    // Clear skeleton rows
    this.recentAttendanceBody.innerHTML = "";

    // Check if we have data
    if (
      !this.state.recentAttendance ||
      this.state.recentAttendance.length === 0
    ) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML = `<td colspan="5" class="text-center">No recent attendance records found</td>`;
      this.recentAttendanceBody.appendChild(emptyRow);
      return;
    }

    // Add attendance rows
    this.state.recentAttendance.forEach((record) => {
      const row = document.createElement("tr");

      // Format dates
      const timeIn = record.time_in
        ? new Date(record.time_in).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-";
      const timeOut = record.time_out
        ? new Date(record.time_out).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-";

      // Determine status
      let status = "Present";
      let statusClass = "status-present";

      if (record.is_late) {
        status = "Late";
        statusClass = "status-late";
      }

      row.innerHTML = `
        <td>
          <div class="user-info">
            <div class="user-avatar">
              <img src="${
                record.personnel.photo_url || "assets/images/default-avatar.png"
              }" alt="${record.personnel.name}">
            </div>
            <div class="user-details">
              <div class="user-name">${record.personnel.name}</div>
              <div class="user-position">${
                record.personnel.position || "N/A"
              }</div>
            </div>
          </div>
        </td>
        <td>${record.personnel.id_number || "N/A"}</td>
        <td>${timeIn}</td>
        <td>${timeOut}</td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
      `;

      this.recentAttendanceBody.appendChild(row);
    });
  }

  /**
   * Update component state
   * @param {object} newState - New state object
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
  }

  /**
   * Destroy component and clean up
   */
  destroy() {
    // Destroy charts to prevent memory leaks
    if (this.attendanceChart) {
      this.attendanceChart.destroy();
    }

    if (this.personnelChart) {
      this.personnelChart.destroy();
    }

    // Remove event listeners
    if (this.dateRangeButtons) {
      this.dateRangeButtons.forEach((button) => {
        button.removeEventListener("click", null);
      });
    }

    if (this.refreshButton) {
      this.refreshButton.removeEventListener("click", null);
    }

    // Clear container
    this.container.innerHTML = "";
  }
}
