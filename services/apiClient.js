/**
 * API Client for Gegenargument
 * Centralizes all API calls and handles common error scenarios
 */

export class ApiClient {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE || "http://localhost:3001";
  }

  /**
   * Performs a fetch request with common error handling
   * @param {string} endpoint - API endpoint to call
   * @param {Object} options - Fetch options
   * @returns {Promise<any>} - Response data
   */
  async fetchWithErrorHandling(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      console.log(`API Request: ${options.method || "GET"} ${url}`);
      const response = await fetch(url, options);

      if (!response.ok) {
        console.error(`API error: ${response.status} for ${endpoint}`);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API fetch error for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get all published arguments
   * @param {number} limit - Optional limit parameter
   * @returns {Promise<Array>} - Array of arguments
   */
  async getArguments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.fetchWithErrorHandling(`/api/arguments?${query}`);
  }

  /**
   * Get argument by slug
   * @param {string} slug - Argument slug
   * @returns {Promise<Object>} - Argument object
   */
  async getArgumentBySlug(slug) {
    return this.fetchWithErrorHandling(`/api/arguments/${slug}`);
  }

  /**
   * Search arguments
   * @param {string} query - Search query string
   * @param {string} tags - Comma-separated list of tags
   * @returns {Promise<Array>} - Array of matching arguments
   */
  async searchArguments(query, tags = "") {
    const tagQuery = tags ? `&tags=${encodeURIComponent(tags)}` : "";
    return this.fetchWithErrorHandling(
      `/api/arguments/search?q=${encodeURIComponent(query)}${tagQuery}`
    );
  }

  /**
   * Get all tags
   * @returns {Promise<Array>} - Array of tags
   */
  async getTags() {
    return this.fetchWithErrorHandling("/api/tags");
  }

  /**
   * Submit a new argument
   * @param {Object} argumentData - Argument data to submit
   * @returns {Promise<Object>} - Response from server
   */
  async submitArgument(argumentData) {
    return this.fetchWithErrorHandling("/api/arguments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(argumentData),
      credentials: "include", // Include cookies for authentication
    });
  }

  /**
   * Suggest a source for an argument
   * @param {string} slug - Argument slug
   * @param {Object} sourceData - Source data to submit
   * @returns {Promise<Object>} - Response from server
   */
  async suggestSource(slug, sourceData) {
    return this.fetchWithErrorHandling(`/api/arguments/${slug}/sources`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sourceData),
      credentials: "include", // Include cookies for authentication
    });
  }
}
