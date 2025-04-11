import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { instagramService } from "../services/instagram.service";

export const Profile = () => {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [activeCommentId, setActiveCommentId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileData, mediaData] = await Promise.all([
          instagramService.getProfile(token),
          instagramService.getMedia(token),
        ]);
        setProfile(profileData);
        setMedia(mediaData.data || []);
      } catch (err) {
        setError(err.message);
        if (err.message.includes("401")) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token, logout]);

  const handleReply = async (mediaId) => {
    if (!replyText.trim() || !activeCommentId) return;

    try {
      await instagramService.replyToComment(
        mediaId,
        activeCommentId,
        replyText,
        token
      );
      setReplyText("");
      setActiveCommentId(null);
      // Optionally refresh media data to show new reply
    } catch (err) {
      setError("Failed to post reply");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Info */}
      {profile && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-2xl font-bold mb-4">@{profile.username}</h1>
          <p className="text-gray-600">Account Type: {profile.account_type}</p>
          <p className="text-gray-600">Media Count: {profile.media_count}</p>
        </div>
      )}

      {/* Media Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {media.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            {/* Media Content */}
            <div className="aspect-w-1 aspect-h-1">
              {item.media_type === "VIDEO" ? (
                <video
                  src={item.media_url}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={item.media_url}
                  alt={item.caption}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Caption */}
            <div className="p-4">
              <p className="text-gray-800 mb-2">{item.caption}</p>
              <p className="text-gray-500 text-sm">
                {new Date(item.timestamp).toLocaleDateString()}
              </p>

              {/* Comment Reply Form */}
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Reply to comment..."
                  className="w-full p-2 border rounded-lg mb-2"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onClick={() => setActiveCommentId(item.id)}
                />
                <button
                  onClick={() => handleReply(item.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  disabled={!replyText.trim() || !activeCommentId}
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
