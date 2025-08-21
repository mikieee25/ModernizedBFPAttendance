/**
 * Personnel component for managing personnel records
 */
class PersonnelComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.personnelService = window.app.services.personnel;
    this.notificationService = window.app.services.notification;

    // Component state
    this.state = {
      loading: true,
      personnel: [],
      filteredPersonnel: [],
      selectedPersonnel: null,
      filter: "",
      sortField: "name",
      sortDirection: "asc",
      currentPage: 1,
      itemsPerPage: 10,
      totalPages: 1,
    };

    // Initialize component
    this.initialize();
  }

  /**
   * Initialize component
   */
  async initialize() {
    try {
      // Render component
      this.render();

      // Load personnel data
      await this.loadPersonnel();

      // Attach event listeners
      this.attachEventListeners();
    } catch (error) {
      console.error("Failed to initialize personnel component:", error);
      this.notificationService.error(
        "Failed to initialize personnel component"
      );
    }
  }

  /**
   * Render component
   */
  render() {
    const template = `
      <div class="personnel-container">
        <div class="personnel-header">
          <h1 class="personnel-title">Personnel Management</h1>
          <div class="personnel-controls">
            <div class="search-container">
              <input type="text" class="search-input" id="personnel-search" placeholder="Search personnel...">
              <i class="fas fa-search search-icon"></i>
            </div>
            <button class="btn btn-primary" id="add-personnel-btn">
              <i class="fas fa-plus"></i> Add Personnel
            </button>
          </div>
        </div>
        
        <div class="personnel-content">
          <div class="personnel-table-container">
            <table class="table personnel-table">
              <thead>
                <tr>
                  <th data-sort="id_number">ID Number <i class="fas fa-sort"></i></th>
                  <th data-sort="name">Name <i class="fas fa-sort"></i></th>
                  <th data-sort="position">Position <i class="fas fa-sort"></i></th>
                  <th data-sort="department">Department <i class="fas fa-sort"></i></th>
                  <th data-sort="status">Status <i class="fas fa-sort"></i></th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="personnel-table-body">
                <tr class="skeleton-row">
                  <td><div class="skeleton-loader"></div></td>
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
                  <td><div class="skeleton-loader"></div></td>
                </tr>
                <tr class="skeleton-row">
                  <td><div class="skeleton-loader"></div></td>
                  <td><div class="skeleton-loader"></div></td>
                  <td><div class="skeleton-loader"></div></td>
                  <td><div class="skeleton-loader"></div></td>
                  <td><div class="skeleton-loader"></div></td>
                  <td><div class="skeleton-loader"></div></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="pagination-container" id="pagination-container">
            <div class="pagination-info">
              Showing <span id="pagination-start">0</span> to <span id="pagination-end">0</span> of <span id="pagination-total">0</span> entries
            </div>
            <div class="pagination-controls">
              <button class="btn btn-sm btn-outline" id="pagination-prev" disabled>
                <i class="fas fa-chevron-left"></i> Previous
              </button>
              <div class="pagination-pages" id="pagination-pages"></div>
              <button class="btn btn-sm btn-outline" id="pagination-next" disabled>
                Next <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Personnel Details Modal -->
        <div class="modal" id="personnel-modal">
          <div class="modal-backdrop"></div>
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h3 class="modal-title">Personnel Details</h3>
                <button class="modal-close" id="modal-close">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="modal-body" id="personnel-modal-body">
                <!-- Modal content will be rendered here -->
              </div>
            </div>
          </div>
        </div>
        
        <!-- Confirmation Modal -->
        <div class="modal" id="confirm-modal">
          <div class="modal-backdrop"></div>
          <div class="modal-dialog modal-sm">
            <div class="modal-content">
              <div class="modal-header">
                <h3 class="modal-title">Confirm Action</h3>
                <button class="modal-close" id="confirm-modal-close">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="modal-body">
                <p id="confirm-message">Are you sure you want to proceed?</p>
              </div>
              <div class="modal-footer">
                <button class="btn btn-outline" id="confirm-cancel">Cancel</button>
                <button class="btn btn-danger" id="confirm-ok">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Set container content
    this.container.innerHTML = template;

    // Get DOM elements
    this.searchInput = document.getElementById("personnel-search");
    this.addPersonnelBtn = document.getElementById("add-personnel-btn");
    this.personnelTableBody = document.getElementById("personnel-table-body");
    this.paginationContainer = document.getElementById("pagination-container");
    this.paginationStart = document.getElementById("pagination-start");
    this.paginationEnd = document.getElementById("pagination-end");
    this.paginationTotal = document.getElementById("pagination-total");
    this.paginationPrev = document.getElementById("pagination-prev");
    this.paginationNext = document.getElementById("pagination-next");
    this.paginationPages = document.getElementById("pagination-pages");
    this.sortHeaders = document.querySelectorAll("th[data-sort]");

    // Modal elements
    this.personnelModal = document.getElementById("personnel-modal");
    this.modalClose = document.getElementById("modal-close");
    this.personnelModalBody = document.getElementById("personnel-modal-body");
    this.confirmModal = document.getElementById("confirm-modal");
    this.confirmModalClose = document.getElementById("confirm-modal-close");
    this.confirmMessage = document.getElementById("confirm-message");
    this.confirmCancel = document.getElementById("confirm-cancel");
    this.confirmOk = document.getElementById("confirm-ok");
  }

  /**
   * Load personnel data
   */
  async loadPersonnel() {
    try {
      this.setState({ loading: true });

      // Get personnel from API
      const response = await this.personnelService.getAllPersonnel();

      if (response.success) {
        // Update state
        this.setState({
          loading: false,
          personnel: response.data || [],
          filteredPersonnel: response.data || [],
        });

        // Sort and filter personnel
        this.sortAndFilterPersonnel();

        // Update pagination
        this.updatePagination();

        // Render personnel table
        this.renderPersonnelTable();
      } else {
        throw new Error(response.error || "Failed to load personnel data");
      }
    } catch (error) {
      console.error("Failed to load personnel:", error);
      this.notificationService.error("Failed to load personnel data");

      // Update state
      this.setState({ loading: false });

      // Show error in table
      this.personnelTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">
            <div class="error-message">
              <i class="fas fa-exclamation-triangle"></i>
              <p>Failed to load personnel data</p>
              <button class="btn btn-sm btn-outline" id="retry-btn">Retry</button>
            </div>
          </td>
        </tr>
      `;

      // Add retry button event listener
      document.getElementById("retry-btn").addEventListener("click", () => {
        this.loadPersonnel();
      });
    }
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Search input
    this.searchInput.addEventListener("input", () => {
      this.setState({ filter: this.searchInput.value, currentPage: 1 });
      this.sortAndFilterPersonnel();
      this.updatePagination();
      this.renderPersonnelTable();
    });

    // Add personnel button
    this.addPersonnelBtn.addEventListener("click", () => {
      window.app.router.navigate("/personnel/add");
    });

    // Sort headers
    this.sortHeaders.forEach((header) => {
      header.addEventListener("click", () => {
        const field = header.dataset.sort;

        // Toggle sort direction if clicking on same field
        if (field === this.state.sortField) {
          this.setState({
            sortDirection: this.state.sortDirection === "asc" ? "desc" : "asc",
          });
        } else {
          this.setState({ sortField: field, sortDirection: "asc" });
        }

        // Update sort icons
        this.updateSortIcons();

        // Sort and filter personnel
        this.sortAndFilterPersonnel();

        // Render personnel table
        this.renderPersonnelTable();
      });
    });

    // Pagination prev button
    this.paginationPrev.addEventListener("click", () => {
      if (this.state.currentPage > 1) {
        this.setState({ currentPage: this.state.currentPage - 1 });
        this.updatePagination();
        this.renderPersonnelTable();
      }
    });

    // Pagination next button
    this.paginationNext.addEventListener("click", () => {
      if (this.state.currentPage < this.state.totalPages) {
        this.setState({ currentPage: this.state.currentPage + 1 });
        this.updatePagination();
        this.renderPersonnelTable();
      }
    });

    // Modal close button
    this.modalClose.addEventListener("click", () => {
      this.closePersonnelModal();
    });

    // Confirm modal close buttons
    this.confirmModalClose.addEventListener("click", () => {
      this.closeConfirmModal();
    });

    this.confirmCancel.addEventListener("click", () => {
      this.closeConfirmModal();
    });

    // Global events
    window.app.events.on("personnel:created", () => {
      this.loadPersonnel();
    });

    window.app.events.on("personnel:updated", () => {
      this.loadPersonnel();
    });

    window.app.events.on("personnel:deleted", () => {
      this.loadPersonnel();
    });
  }

  /**
   * Sort and filter personnel
   */
  sortAndFilterPersonnel() {
    // Filter personnel
    const filter = this.state.filter.toLowerCase();

    if (filter) {
      this.filteredPersonnel = this.state.personnel.filter((person) => {
        return (
          (person.id_number &&
            person.id_number.toLowerCase().includes(filter)) ||
          (person.name && person.name.toLowerCase().includes(filter)) ||
          (person.position && person.position.toLowerCase().includes(filter)) ||
          (person.department &&
            person.department.toLowerCase().includes(filter))
        );
      });
    } else {
      this.filteredPersonnel = [...this.state.personnel];
    }

    // Sort personnel
    const field = this.state.sortField;
    const direction = this.state.sortDirection;

    this.filteredPersonnel.sort((a, b) => {
      let valueA = a[field] || "";
      let valueB = b[field] || "";

      // Handle case insensitive string comparison
      if (typeof valueA === "string") valueA = valueA.toLowerCase();
      if (typeof valueB === "string") valueB = valueB.toLowerCase();

      if (valueA < valueB) return direction === "asc" ? -1 : 1;
      if (valueA > valueB) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  /**
   * Update pagination
   */
  updatePagination() {
    const totalItems = this.filteredPersonnel.length;
    const totalPages = Math.ceil(totalItems / this.state.itemsPerPage) || 1;

    // Update state
    this.setState({ totalPages });

    // Adjust current page if out of bounds
    if (this.state.currentPage > totalPages) {
      this.setState({ currentPage: totalPages });
    }

    // Calculate pagination info
    const start = (this.state.currentPage - 1) * this.state.itemsPerPage + 1;
    const end = Math.min(start + this.state.itemsPerPage - 1, totalItems);

    // Update pagination info
    this.paginationStart.textContent = totalItems === 0 ? 0 : start;
    this.paginationEnd.textContent = end;
    this.paginationTotal.textContent = totalItems;

    // Update pagination buttons
    this.paginationPrev.disabled = this.state.currentPage === 1;
    this.paginationNext.disabled = this.state.currentPage === totalPages;

    // Generate page buttons
    this.paginationPages.innerHTML = "";

    // Determine range of pages to show
    let startPage = Math.max(1, this.state.currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    // Adjust range if not enough pages at the end
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    // Add first page button if not in range
    if (startPage > 1) {
      const pageButton = document.createElement("button");
      pageButton.className = "btn btn-sm btn-outline page-number";
      pageButton.textContent = "1";
      pageButton.addEventListener("click", () => {
        this.setState({ currentPage: 1 });
        this.updatePagination();
        this.renderPersonnelTable();
      });
      this.paginationPages.appendChild(pageButton);

      // Add ellipsis if needed
      if (startPage > 2) {
        const ellipsis = document.createElement("span");
        ellipsis.className = "pagination-ellipsis";
        ellipsis.textContent = "...";
        this.paginationPages.appendChild(ellipsis);
      }
    }

    // Add page buttons
    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement("button");
      pageButton.className = `btn btn-sm ${
        i === this.state.currentPage ? "btn-primary" : "btn-outline"
      } page-number`;
      pageButton.textContent = i.toString();

      pageButton.addEventListener("click", () => {
        this.setState({ currentPage: i });
        this.updatePagination();
        this.renderPersonnelTable();
      });

      this.paginationPages.appendChild(pageButton);
    }

    // Add last page button if not in range
    if (endPage < totalPages) {
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        const ellipsis = document.createElement("span");
        ellipsis.className = "pagination-ellipsis";
        ellipsis.textContent = "...";
        this.paginationPages.appendChild(ellipsis);
      }

      const pageButton = document.createElement("button");
      pageButton.className = "btn btn-sm btn-outline page-number";
      pageButton.textContent = totalPages.toString();
      pageButton.addEventListener("click", () => {
        this.setState({ currentPage: totalPages });
        this.updatePagination();
        this.renderPersonnelTable();
      });
      this.paginationPages.appendChild(pageButton);
    }
  }

  /**
   * Update sort icons
   */
  updateSortIcons() {
    // Update all sort icons
    this.sortHeaders.forEach((header) => {
      const field = header.dataset.sort;
      const icon = header.querySelector("i");

      if (field === this.state.sortField) {
        icon.className = `fas fa-sort-${
          this.state.sortDirection === "asc" ? "up" : "down"
        }`;
      } else {
        icon.className = "fas fa-sort";
      }
    });
  }

  /**
   * Render personnel table
   */
  renderPersonnelTable() {
    // Clear table body
    this.personnelTableBody.innerHTML = "";

    // Check if we have data
    if (this.filteredPersonnel.length === 0) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML = `
        <td colspan="6" class="text-center">
          <div class="empty-message">
            <i class="fas fa-user-slash"></i>
            <p>No personnel found</p>
          </div>
        </td>
      `;
      this.personnelTableBody.appendChild(emptyRow);
      return;
    }

    // Calculate pagination
    const start = (this.state.currentPage - 1) * this.state.itemsPerPage;
    const end = start + this.state.itemsPerPage;
    const paginatedPersonnel = this.filteredPersonnel.slice(start, end);

    // Add personnel rows
    paginatedPersonnel.forEach((person) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${person.id_number || "N/A"}</td>
        <td>
          <div class="user-info">
            <div class="user-avatar">
              <img src="${
                person.photo_url || "assets/images/default-avatar.png"
              }" alt="${person.name}">
            </div>
            <div class="user-name">${person.name}</div>
          </div>
        </td>
        <td>${person.position || "N/A"}</td>
        <td>${person.department || "N/A"}</td>
        <td><span class="status-badge ${
          person.status === "active" ? "status-active" : "status-inactive"
        }">${person.status || "Inactive"}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-icon btn-view" data-id="${
              person.id
            }" title="View Details">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-icon btn-edit" data-id="${
              person.id
            }" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-icon btn-delete" data-id="${
              person.id
            }" title="Delete">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      `;

      // Add event listeners to buttons
      row.querySelector(".btn-view").addEventListener("click", () => {
        this.viewPersonnel(person.id);
      });

      row.querySelector(".btn-edit").addEventListener("click", () => {
        window.app.router.navigate(`/personnel/edit/${person.id}`);
      });

      row.querySelector(".btn-delete").addEventListener("click", () => {
        this.confirmDeletePersonnel(person);
      });

      this.personnelTableBody.appendChild(row);
    });
  }

  /**
   * View personnel details
   * @param {number} id - Personnel ID
   */
  async viewPersonnel(id) {
    try {
      // Show loading in modal
      this.personnelModalBody.innerHTML = `
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Loading personnel details...</p>
        </div>
      `;

      // Show modal
      this.personnelModal.classList.add("active");

      // Get personnel details
      const response = await this.personnelService.getPersonnelById(id);

      if (response.success) {
        const person = response.data;

        // Store selected personnel
        this.setState({ selectedPersonnel: person });

        // Format dates
        const createdAt = new Date(person.created_at).toLocaleDateString();
        const updatedAt = new Date(person.updated_at).toLocaleDateString();

        // Render personnel details
        this.personnelModalBody.innerHTML = `
          <div class="personnel-details">
            <div class="details-header">
              <div class="personnel-photo">
                <img src="${
                  person.photo_url || "assets/images/default-avatar.png"
                }" alt="${person.name}">
              </div>
              <div class="personnel-info">
                <h3 class="personnel-name">${person.name}</h3>
                <p class="personnel-position">${person.position || "N/A"}</p>
                <p class="personnel-department">${
                  person.department || "N/A"
                }</p>
                <span class="status-badge ${
                  person.status === "active"
                    ? "status-active"
                    : "status-inactive"
                }">${person.status || "Inactive"}</span>
              </div>
            </div>
            
            <div class="details-content">
              <div class="details-section">
                <h4 class="section-title">Personal Information</h4>
                <div class="details-grid">
                  <div class="detail-item">
                    <div class="detail-label">ID Number</div>
                    <div class="detail-value">${person.id_number || "N/A"}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Email</div>
                    <div class="detail-value">${person.email || "N/A"}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">${person.phone || "N/A"}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Address</div>
                    <div class="detail-value">${person.address || "N/A"}</div>
                  </div>
                </div>
              </div>
              
              <div class="details-section">
                <h4 class="section-title">Employment Information</h4>
                <div class="details-grid">
                  <div class="detail-item">
                    <div class="detail-label">Position</div>
                    <div class="detail-value">${person.position || "N/A"}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Department</div>
                    <div class="detail-value">${
                      person.department || "N/A"
                    }</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Join Date</div>
                    <div class="detail-value">${person.join_date || "N/A"}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Status</div>
                    <div class="detail-value">${
                      person.status || "Inactive"
                    }</div>
                  </div>
                </div>
              </div>
              
              <div class="details-section">
                <h4 class="section-title">System Information</h4>
                <div class="details-grid">
                  <div class="detail-item">
                    <div class="detail-label">Created At</div>
                    <div class="detail-value">${createdAt}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Updated At</div>
                    <div class="detail-value">${updatedAt}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Face Data</div>
                    <div class="detail-value">${
                      person.has_face_data ? "Registered" : "Not Registered"
                    }</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="details-actions">
              <button class="btn btn-outline" id="view-attendance-btn">
                <i class="fas fa-calendar-check"></i> View Attendance
              </button>
              <button class="btn btn-outline" id="manage-face-btn">
                <i class="fas fa-user-circle"></i> Manage Face Data
              </button>
              <button class="btn btn-primary" id="edit-personnel-btn">
                <i class="fas fa-edit"></i> Edit Personnel
              </button>
            </div>
          </div>
        `;

        // Add action button event listeners
        document
          .getElementById("view-attendance-btn")
          .addEventListener("click", () => {
            this.closePersonnelModal();
            window.app.router.navigate(`/attendance/personnel/${person.id}`);
          });

        document
          .getElementById("manage-face-btn")
          .addEventListener("click", () => {
            this.closePersonnelModal();
            window.app.router.navigate(`/personnel/${person.id}/face`);
          });

        document
          .getElementById("edit-personnel-btn")
          .addEventListener("click", () => {
            this.closePersonnelModal();
            window.app.router.navigate(`/personnel/edit/${person.id}`);
          });
      } else {
        throw new Error(response.error || "Failed to get personnel details");
      }
    } catch (error) {
      console.error("Failed to view personnel:", error);

      // Show error in modal
      this.personnelModalBody.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Failed to load personnel details</p>
          <button class="btn btn-sm btn-outline" id="retry-view-btn">Retry</button>
        </div>
      `;

      // Add retry button event listener
      document
        .getElementById("retry-view-btn")
        .addEventListener("click", () => {
          this.viewPersonnel(id);
        });
    }
  }

  /**
   * Close personnel modal
   */
  closePersonnelModal() {
    this.personnelModal.classList.remove("active");
    this.setState({ selectedPersonnel: null });
  }

  /**
   * Confirm delete personnel
   * @param {object} person - Personnel object
   */
  confirmDeletePersonnel(person) {
    // Set confirm message
    this.confirmMessage.textContent = `Are you sure you want to delete ${person.name}?`;

    // Set confirm button action
    this.confirmOk.onclick = () => {
      this.deletePersonnel(person.id);
      this.closeConfirmModal();
    };

    // Show modal
    this.confirmModal.classList.add("active");
  }

  /**
   * Close confirm modal
   */
  closeConfirmModal() {
    this.confirmModal.classList.remove("active");
  }

  /**
   * Delete personnel
   * @param {number} id - Personnel ID
   */
  async deletePersonnel(id) {
    try {
      // Show loading notification
      const loadingId = this.notificationService.info(
        "Deleting personnel...",
        0
      );

      // Delete personnel
      const response = await this.personnelService.deletePersonnel(id);

      // Dismiss loading notification
      this.notificationService.dismiss(loadingId);

      if (response.success) {
        // Show success notification
        this.notificationService.success("Personnel deleted successfully");

        // Reload personnel data
        await this.loadPersonnel();
      } else {
        throw new Error(response.error || "Failed to delete personnel");
      }
    } catch (error) {
      console.error("Failed to delete personnel:", error);
      this.notificationService.error("Failed to delete personnel");
    }
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
    // Remove event listeners
    if (this.searchInput) {
      this.searchInput.removeEventListener("input", null);
    }

    if (this.addPersonnelBtn) {
      this.addPersonnelBtn.removeEventListener("click", null);
    }

    if (this.sortHeaders) {
      this.sortHeaders.forEach((header) => {
        header.removeEventListener("click", null);
      });
    }

    if (this.paginationPrev) {
      this.paginationPrev.removeEventListener("click", null);
    }

    if (this.paginationNext) {
      this.paginationNext.removeEventListener("click", null);
    }

    if (this.modalClose) {
      this.modalClose.removeEventListener("click", null);
    }

    if (this.confirmModalClose) {
      this.confirmModalClose.removeEventListener("click", null);
    }

    if (this.confirmCancel) {
      this.confirmCancel.removeEventListener("click", null);
    }

    // Unsubscribe from events
    window.app.events.off("personnel:created");
    window.app.events.off("personnel:updated");
    window.app.events.off("personnel:deleted");

    // Clear container
    this.container.innerHTML = "";
  }
}
