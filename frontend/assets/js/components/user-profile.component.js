/**
 * User Profile Component
 * Allows users to view and edit their profile information
 */
export class UserProfileComponent {
  /**
   * Create a new UserProfileComponent
   * @param {Object} options - Component options
   */
  constructor(options = {}) {
    this.options = {
      outlet: null,
      params: {},
      ...options,
    };

    this.outlet = this.options.outlet;
    this.user = null;
    this.isEditing = false;

    this.initialize();
  }

  /**
   * Initialize the component
   */
  async initialize() {
    try {
      // Show loading state
      window.app.ui.showLoading();

      // Get current user data
      this.user = await window.app.services.auth.getCurrentUser();

      if (!this.user) {
        throw new Error("User not found");
      }

      // Render the component
      this.render();

      // Attach event listeners
      this.attachEventListeners();

      // Hide loading
      window.app.ui.hideLoading();
    } catch (error) {
      console.error("Error initializing user profile:", error);
      window.app.ui.showNotification("Failed to load user profile", "error");
      window.app.ui.hideLoading();
    }
  }

  /**
   * Render the component
   */
  render() {
    const { username, email, name, role, created_at, last_login } = this.user;

    const createdDate = new Date(created_at).toLocaleDateString();
    const lastLoginDate = last_login
      ? new Date(last_login).toLocaleString()
      : "Never";

    const html = `
      <div class="user-profile fade-in">
        <div class="mb-6">
          <h1 class="text-2xl font-bold mb-2">User Profile</h1>
          <p class="text-gray-600">View and manage your account information</p>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center mb-6">
            <div class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mr-4">
              <span class="text-3xl text-gray-500">${
                name
                  ? name.charAt(0).toUpperCase()
                  : username.charAt(0).toUpperCase()
              }</span>
            </div>
            <div>
              <h2 class="text-xl font-semibold">${name || username}</h2>
              <p class="text-gray-600">${
                role.charAt(0).toUpperCase() + role.slice(1)
              }</p>
            </div>
          </div>
          
          <div id="profile-view" class="${this.isEditing ? "hidden" : ""}">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-gray-700 text-sm font-medium mb-1">Username</label>
                  <div class="text-gray-900">${username}</div>
                </div>
                
                <div>
                  <label class="block text-gray-700 text-sm font-medium mb-1">Email</label>
                  <div class="text-gray-900">${email || "Not set"}</div>
                </div>
                
                <div>
                  <label class="block text-gray-700 text-sm font-medium mb-1">Full Name</label>
                  <div class="text-gray-900">${name || "Not set"}</div>
                </div>
              </div>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-gray-700 text-sm font-medium mb-1">Role</label>
                  <div class="text-gray-900">${
                    role.charAt(0).toUpperCase() + role.slice(1)
                  }</div>
                </div>
                
                <div>
                  <label class="block text-gray-700 text-sm font-medium mb-1">Account Created</label>
                  <div class="text-gray-900">${createdDate}</div>
                </div>
                
                <div>
                  <label class="block text-gray-700 text-sm font-medium mb-1">Last Login</label>
                  <div class="text-gray-900">${lastLoginDate}</div>
                </div>
              </div>
            </div>
            
            <div class="mt-6 pt-6 border-t border-gray-200 flex">
              <button id="edit-profile-btn" class="btn btn-primary mr-2">
                <i class="fas fa-edit mr-2"></i> Edit Profile
              </button>
              <button id="change-password-btn" class="btn btn-outline">
                <i class="fas fa-key mr-2"></i> Change Password
              </button>
            </div>
          </div>
          
          <div id="profile-edit" class="${this.isEditing ? "" : "hidden"}">
            <form id="profile-form" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <div class="form-group">
                    <label for="username" class="form-label">Username</label>
                    <input type="text" id="username" class="form-control" value="${username}" disabled>
                  </div>
                  
                  <div class="form-group">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" id="email" class="form-control" value="${
                      email || ""
                    }" required>
                  </div>
                </div>
                
                <div class="space-y-4">
                  <div class="form-group">
                    <label for="name" class="form-label">Full Name</label>
                    <input type="text" id="name" class="form-control" value="${
                      name || ""
                    }" required>
                  </div>
                </div>
              </div>
              
              <div class="mt-6 pt-6 border-t border-gray-200 flex">
                <button type="submit" class="btn btn-primary mr-2">
                  <i class="fas fa-save mr-2"></i> Save Changes
                </button>
                <button type="button" id="cancel-edit-btn" class="btn btn-outline">
                  <i class="fas fa-times mr-2"></i> Cancel
                </button>
              </div>
            </form>
          </div>
          
          <div id="password-change" class="hidden mt-6 pt-6 border-t border-gray-200">
            <h3 class="text-lg font-medium mb-4">Change Password</h3>
            <form id="password-form" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <div class="form-group">
                    <label for="current-password" class="form-label">Current Password</label>
                    <input type="password" id="current-password" class="form-control" required>
                  </div>
                  
                  <div class="form-group">
                    <label for="new-password" class="form-label">New Password</label>
                    <input type="password" id="new-password" class="form-control" required>
                  </div>
                  
                  <div class="form-group">
                    <label for="confirm-password" class="form-label">Confirm New Password</label>
                    <input type="password" id="confirm-password" class="form-control" required>
                  </div>
                </div>
              </div>
              
              <div class="flex">
                <button type="submit" class="btn btn-primary mr-2">
                  <i class="fas fa-key mr-2"></i> Update Password
                </button>
                <button type="button" id="cancel-password-btn" class="btn btn-outline">
                  <i class="fas fa-times mr-2"></i> Cancel
                </button>
              </div>
            </form>
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
    // Edit profile button
    const editProfileBtn = document.getElementById("edit-profile-btn");
    if (editProfileBtn) {
      editProfileBtn.addEventListener("click", () => this.toggleEditMode(true));
    }

    // Cancel edit button
    const cancelEditBtn = document.getElementById("cancel-edit-btn");
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener("click", () => this.toggleEditMode(false));
    }

    // Profile form submission
    const profileForm = document.getElementById("profile-form");
    if (profileForm) {
      profileForm.addEventListener("submit", (e) =>
        this.handleProfileUpdate(e)
      );
    }

    // Change password button
    const changePasswordBtn = document.getElementById("change-password-btn");
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener("click", () =>
        this.togglePasswordChange(true)
      );
    }

    // Cancel password change button
    const cancelPasswordBtn = document.getElementById("cancel-password-btn");
    if (cancelPasswordBtn) {
      cancelPasswordBtn.addEventListener("click", () =>
        this.togglePasswordChange(false)
      );
    }

    // Password form submission
    const passwordForm = document.getElementById("password-form");
    if (passwordForm) {
      passwordForm.addEventListener("submit", (e) =>
        this.handlePasswordUpdate(e)
      );
    }
  }

  /**
   * Toggle edit mode
   * @param {boolean} isEditing - Whether to enable edit mode
   */
  toggleEditMode(isEditing) {
    this.isEditing = isEditing;

    const profileView = document.getElementById("profile-view");
    const profileEdit = document.getElementById("profile-edit");
    const passwordChange = document.getElementById("password-change");

    if (profileView && profileEdit) {
      profileView.classList.toggle("hidden", isEditing);
      profileEdit.classList.toggle("hidden", !isEditing);

      // Hide password change form if switching to edit mode
      if (isEditing && passwordChange) {
        passwordChange.classList.add("hidden");
      }
    }
  }

  /**
   * Toggle password change form
   * @param {boolean} show - Whether to show the password change form
   */
  togglePasswordChange(show) {
    const profileView = document.getElementById("profile-view");
    const profileEdit = document.getElementById("profile-edit");
    const passwordChange = document.getElementById("password-change");

    if (profileView && profileEdit && passwordChange) {
      passwordChange.classList.toggle("hidden", !show);
      profileView.classList.toggle("hidden", show);
      profileEdit.classList.add("hidden");
    }
  }

  /**
   * Handle profile update
   * @param {Event} e - Form submit event
   */
  async handleProfileUpdate(e) {
    e.preventDefault();

    try {
      window.app.ui.showLoading();

      const email = document.getElementById("email").value.trim();
      const name = document.getElementById("name").value.trim();

      // Update user profile
      const updatedUser = await window.app.services.user.updateProfile({
        email,
        name,
      });

      // Update local user data
      this.user = {
        ...this.user,
        ...updatedUser,
      };

      // Switch back to view mode
      this.toggleEditMode(false);

      // Re-render with updated data
      this.render();
      this.attachEventListeners();

      // Show success message
      window.app.ui.showNotification("Profile updated successfully", "success");

      window.app.ui.hideLoading();
    } catch (error) {
      console.error("Error updating profile:", error);
      window.app.ui.showNotification("Failed to update profile", "error");
      window.app.ui.hideLoading();
    }
  }

  /**
   * Handle password update
   * @param {Event} e - Form submit event
   */
  async handlePasswordUpdate(e) {
    e.preventDefault();

    try {
      const currentPassword = document.getElementById("current-password").value;
      const newPassword = document.getElementById("new-password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      // Check if passwords match
      if (newPassword !== confirmPassword) {
        window.app.ui.showNotification("New passwords do not match", "error");
        return;
      }

      window.app.ui.showLoading();

      // Update password
      await window.app.services.user.changePassword({
        currentPassword,
        newPassword,
      });

      // Reset form
      document.getElementById("password-form").reset();

      // Switch back to view mode
      this.togglePasswordChange(false);

      // Show success message
      window.app.ui.showNotification(
        "Password updated successfully",
        "success"
      );

      window.app.ui.hideLoading();
    } catch (error) {
      console.error("Error updating password:", error);
      window.app.ui.showNotification("Failed to update password", "error");
      window.app.ui.hideLoading();
    }
  }

  /**
   * Clean up component resources
   */
  destroy() {
    // Nothing specific to clean up
  }
}
