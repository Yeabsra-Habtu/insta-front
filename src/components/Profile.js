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
  const [commentText, setCommentText] = useState("");
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [mediaComments, setMediaComments] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileData, mediaData] = await Promise.all([
          instagramService.getProfile(token),
          instagramService.getMedia(token),
        ]);
        setProfile(profileData);
        const mediaItems = mediaData.data || [];
        setMedia(mediaItems);

        // Fetch comments for each media item
        const commentsPromises = mediaItems.map((item) =>
          instagramService
            .getComments(item.id, token)
            .then((comments) => ({ mediaId: item.id, comments }))
            .catch(() => ({ mediaId: item.id, comments: [] }))
        );

        const commentsResults = await Promise.all(commentsPromises);
        const commentsMap = {};
        commentsResults.forEach(({ mediaId, comments }) => {
          commentsMap[mediaId] = comments;
        });
        setMediaComments(commentsMap);
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

  const handleComment = async (mediaId) => {
    if (!commentText.trim()) return;

    try {
      const newComment = await instagramService.createComment(
        mediaId,
        commentText,
        token
      );
      setMediaComments((prev) => ({
        ...prev,
        [mediaId]: [...(prev[mediaId] || []), newComment],
      }));
      setCommentText("");
    } catch (err) {
      setError("Failed to post comment");
    }
  };

  const handleReply = async (mediaId) => {
    if (!replyText.trim() || !activeCommentId) return;

    try {
      const reply = await instagramService.replyToComment(
        mediaId,
        activeCommentId,
        replyText,
        token
      );
      setMediaComments((prev) => ({
        ...prev,
        [mediaId]: prev[mediaId].map((comment) =>
          comment.id === activeCommentId
            ? { ...comment, replies: [...(comment.replies || []), reply] }
            : comment
        ),
      }));
      setReplyText("");
      setActiveCommentId(null);
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

            {/* Caption and Comments */}
            <div className="p-4">
              <p className="text-gray-800 mb-2">{item.caption}</p>
              <p className="text-gray-500 text-sm mb-4">
                {new Date(item.timestamp).toLocaleDateString()}
              </p>

              {/* Comments Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Comments</h3>
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {(mediaComments[item.id] || []).map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-800">{comment.text}</p>
                      <div className="mt-2 pl-4 space-y-2">
                        {(comment.replies ?? []).map((reply) => (
                          <div
                            key={reply.id}
                            className="text-sm text-gray-600 bg-gray-100 rounded p-2"
                          >
                            {reply.text}
                          </div>
                        ))}
                      </div>
                      {/* Reply Form */}
                      {activeCommentId === comment.id && (
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder="Write a reply..."
                            className="w-full p-2 text-sm border rounded"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                          <button
                            onClick={() => handleReply(item.id)}
                            className="mt-1 text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
                            disabled={!replyText.trim()}
                          >
                            Reply
                          </button>
                        </div>
                      )}
                      {activeCommentId !== comment.id && (
                        <button
                          onClick={() => setActiveCommentId(comment.id)}
                          className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                          Reply
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* New Comment Form */}
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    className="w-full p-2 border rounded-lg mb-2"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button
                    onClick={() => handleComment(item.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    disabled={!commentText.trim()}
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
