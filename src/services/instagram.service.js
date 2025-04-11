const API_BASE_URL = "https://insta-back-sh0s.onrender.com/api/instagram";

export const instagramService = {
  async getProfile(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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

  async replyToComment(mediaId, commentId, message, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/comment/${mediaId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commentId, message }),
      });
      if (!response.ok) throw new Error("Failed to reply to comment");
      return await response.json();
    } catch (error) {
      console.error("Error replying to comment:", error);
      throw error;
    }
  },
};
