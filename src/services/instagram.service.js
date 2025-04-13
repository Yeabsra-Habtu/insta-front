const API_BASE_URL = "https://insta-back-sh0s.onrender.com/api/instagram";

export const instagramService = {
  async logout(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to logout");
      return await response.json();
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  },
  async getProfile(token) {
    try {
      console.log("token from getProfile:", token); // Add thi

      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Response from ge tProfile:", response); // Add thi
      if (!response.ok) throw new Error("Failed to fetch profile");
      return await response.json();
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },

  async getMedia(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/media`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch media");
      return await response.json();
    } catch (error) {
      console.error("Error fetching media:", error);
      throw error;
    }
  },

  async getComments(mediaId, token) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/media/${mediaId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch comments");
      return await response.json();
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  },

  async createComment(mediaId, message, token) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/media/${mediaId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message }),
        }
      );
      if (!response.ok) throw new Error("Failed to create comment");
      return await response.json();
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  },

  async replyToComment(mediaId, commentId, message, token) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/media/${mediaId}/comment/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ commentId, message }),
        }
      );
      if (!response.ok) throw new Error("Failed to reply to comment");
      return await response.json();
    } catch (error) {
      console.error("Error replying to comment:", error);
      throw error;
    }
  },
};
