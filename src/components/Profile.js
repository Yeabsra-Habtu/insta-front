import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { instagramService } from "../services/instagram.service";

export const Profile = () => {
  const { token, logout, login } = useAuth();
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700 mb-2">{error}</p>
          <button
            onClick={() => {
              setError(null);
              login();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry Login
          </button>
        </div>
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
              {/* Comment Reply Form */}
              {item.comments &&
                item.comments.data &&
                item.comments.data.length > 0 && (
                  <div className="mt-4">
                    <div className="mb-4">
                      {item.comments.data.map((comment) => (
                        <div
                          key={comment.id}
                          className="mb-2 p-2 bg-gray-50 rounded"
                        >
                          <p className="text-sm">{comment.text}</p>
                          <button
                            onClick={() => setActiveCommentId(comment.id)}
                            className="text-xs text-blue-500 mt-1"
                          >
                            Reply to this comment
                          </button>
                        </div>
                      ))}
                    </div>
                    {activeCommentId && (
                      <div>
                        <input
                          type="text"
                          placeholder="Write your reply..."
                          className="w-full p-2 border rounded-lg mb-2"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                        <button
                          onClick={() => handleReply(item.id)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                          disabled={!replyText.trim()}
                        >
                          Send Reply
                        </button>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
