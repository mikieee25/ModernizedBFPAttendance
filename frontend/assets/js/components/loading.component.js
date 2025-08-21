/**
 * Loading Component
 * Displays a loading spinner or skeleton UI while content is loading
 */
export class LoadingComponent {
  /**
   * Create a new LoadingComponent
   * @param {Object} options - Component options
   * @param {HTMLElement} options.outlet - The container element
   * @param {string} options.type - The type of loading UI ('spinner', 'skeleton', 'progress')
   * @param {string} options.message - Optional message to display
   * @param {boolean} options.fullPage - Whether to display fullscreen
   */
  constructor(options = {}) {
    this.options = {
      outlet: null,
      type: "spinner", // spinner, skeleton, progress
      message: "Loading...",
      fullPage: false,
      ...options,
    };

    this.outlet = this.options.outlet;
    this.type = this.options.type;
    this.message = this.options.message;
    this.fullPage = this.options.fullPage;

    this.progress = 0;
    this.progressInterval = null;

    this.initialize();
  }

  /**
   * Initialize the component
   */
  initialize() {
    this.render();

    if (this.type === "progress") {
      this.startProgressSimulation();
    }
  }

  /**
   * Render the loading UI based on type
   */
  render() {
    let loadingHtml = "";

    switch (this.type) {
      case "spinner":
        loadingHtml = this.renderSpinner();
        break;
      case "skeleton":
        loadingHtml = this.renderSkeleton();
        break;
      case "progress":
        loadingHtml = this.renderProgress();
        break;
      default:
        loadingHtml = this.renderSpinner();
    }

    // Apply full page styling if needed
    if (this.fullPage) {
      loadingHtml = `
        <div class="loading-fullpage fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white bg-opacity-80 z-50">
          ${loadingHtml}
        </div>
      `;
    }

    this.outlet.innerHTML = loadingHtml;
  }

  /**
   * Render spinner loading UI
   * @returns {string} HTML for spinner
   */
  renderSpinner() {
    return `
      <div class="loading-spinner-container text-center p-4">
        <div class="inline-block">
          <div class="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full text-blue-600" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <p class="mt-3 text-gray-600">${this.message}</p>
      </div>
    `;
  }

  /**
   * Render skeleton loading UI
   * @returns {string} HTML for skeleton
   */
  renderSkeleton() {
    return `
      <div class="loading-skeleton-container p-4">
        <div class="animate-pulse">
          <!-- Header skeleton -->
          <div class="flex items-center space-x-4 mb-6">
            <div class="rounded-full bg-gray-300 h-12 w-12"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-300 rounded w-3/4"></div>
              <div class="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
          
          <!-- Content skeleton -->
          <div class="space-y-4">
            <div class="h-3 bg-gray-300 rounded"></div>
            <div class="h-3 bg-gray-300 rounded w-5/6"></div>
            <div class="h-3 bg-gray-300 rounded w-4/6"></div>
          </div>
          
          <!-- Card skeleton -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            ${this.renderSkeletonCard().repeat(3)}
          </div>
        </div>
        
        <p class="text-center mt-6 text-gray-600">${this.message}</p>
      </div>
    `;
  }

  /**
   * Render a skeleton card
   * @returns {string} HTML for skeleton card
   */
  renderSkeletonCard() {
    return `
      <div class="border rounded-lg p-4 shadow-sm">
        <div class="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
        <div class="space-y-2">
          <div class="h-3 bg-gray-300 rounded"></div>
          <div class="h-3 bg-gray-300 rounded w-5/6"></div>
          <div class="h-3 bg-gray-300 rounded w-2/3"></div>
        </div>
        <div class="mt-4 flex justify-end">
          <div class="h-8 bg-gray-300 rounded w-1/4"></div>
        </div>
      </div>
    `;
  }

  /**
   * Render progress loading UI
   * @returns {string} HTML for progress
   */
  renderProgress() {
    return `
      <div class="loading-progress-container p-4 max-w-lg mx-auto">
        <div class="text-center mb-2">
          <p class="font-medium">${this.message}</p>
          <p class="text-sm text-gray-600" id="loading-progress-percentage">${this.progress}%</p>
        </div>
        
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            id="loading-progress-bar"
            class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style="width: ${this.progress}%">
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Simulate progress for loading bar
   * More realistic than just showing a spinner
   */
  startProgressSimulation() {
    // Clear any existing interval
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }

    // Start with 0% progress
    this.progress = 0;
    this.updateProgressUI();

    // Update progress at varying rates to simulate real loading
    this.progressInterval = setInterval(() => {
      // Move faster initially, then slow down as we approach 90%
      let increment = 0;

      if (this.progress < 30) {
        increment = Math.random() * 5 + 3; // 3-8% increments
      } else if (this.progress < 60) {
        increment = Math.random() * 3 + 1; // 1-4% increments
      } else if (this.progress < 80) {
        increment = Math.random() * 2 + 0.5; // 0.5-2.5% increments
      } else if (this.progress < 90) {
        increment = Math.random() * 0.5 + 0.1; // 0.1-0.6% increments
      } else {
        // Stop at 90% - the final jump to 100% should happen when loading is actually complete
        clearInterval(this.progressInterval);
        return;
      }

      this.progress = Math.min(90, this.progress + increment);
      this.updateProgressUI();
    }, 200);
  }

  /**
   * Update progress bar UI
   */
  updateProgressUI() {
    const progressBar = document.getElementById("loading-progress-bar");
    const percentageText = document.getElementById(
      "loading-progress-percentage"
    );

    if (progressBar && percentageText) {
      const roundedProgress = Math.round(this.progress);
      progressBar.style.width = `${roundedProgress}%`;
      percentageText.textContent = `${roundedProgress}%`;
    }
  }

  /**
   * Complete the progress bar (call when loading is done)
   */
  complete() {
    if (this.type === "progress") {
      // Clear the interval
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
      }

      // Set to 100%
      this.progress = 100;
      this.updateProgressUI();

      // Add a small delay before calling destroy or callback
      setTimeout(() => {
        this.destroy();
      }, 300);
    } else {
      this.destroy();
    }
  }

  /**
   * Update loading message
   * @param {string} message - New message to display
   */
  updateMessage(message) {
    this.message = message;
    this.render();
  }

  /**
   * Clean up component resources
   */
  destroy() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }

    if (this.outlet) {
      this.outlet.innerHTML = "";
    }
  }
}
