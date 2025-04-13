const API_BASE_URL = "https://insta-back-sh0s.onrender.com/api/instagram";

export const instagramService = {
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
      const mediaData = await response.json();

      // Fetch comments for each media item
      if (mediaData.data) {
        const mediaWithComments = await Promise.all(
          mediaData.data.map(async (item) => {
            try {
              const commentsResponse = await fetch(
                `${API_BASE_URL}/media/${item.id}/comments`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              if (commentsResponse.ok) {
                const comments = await commentsResponse.json();
                return { ...item, comments };
              }
              return item;
            } catch (error) {
              console.error(
                `Error fetching comments for media ${item.id}:`,
                error
              );
              return item;
            }
          })
        );
        return { ...mediaData, data: mediaWithComments };
      }
      return mediaData;
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
