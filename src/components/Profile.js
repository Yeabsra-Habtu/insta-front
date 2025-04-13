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
            .then((response) => ({
              mediaId: item.id,
              comments: response.data || [],
            }))
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
      {/* Profile Hero Section */}
      {profile && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg p-8 mb-12 transform hover:scale-[1.02] transition-transform duration-300">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <img
                src={profile.profile_picture_url}
                alt={profile.username}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl object-cover"
              />
              <div className="absolute -bottom-2 right-0 bg-green-400 w-6 h-6 rounded-full border-4 border-white"></div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                @{profile.username}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile.media_count}</p>
                  <p className="text-sm opacity-90">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {profile.followers_count}
                  </p>
                  <p className="text-sm opacity-90">Followers</p>
                </div>
              </div>
              <p className="text-lg opacity-90 mb-4">{profile.biography}</p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-1 bg-white/20 rounded-full text-sm">
                  {profile.account_type}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {media.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-transform duration-300"
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
            <div className="p-6">
              <p className="text-gray-800 text-lg mb-3 font-medium">
                {item.caption}
              </p>
              <p className="text-gray-500 text-sm mb-6">
                {new Date(item.timestamp).toLocaleDateString()}
              </p>

              {/* Comments Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 text-lg mb-4">
                  Comments
                </h3>
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {mediaComments[item.id]?.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <p className="text-sm text-gray-800 font-medium">
                        {comment.text}
                      </p>
                      <div className="mt-2 pl-4 space-y-2">
                        {comment.replies?.map((reply) => (
                          <div
                            key={reply.id}
                            className="text-sm text-gray-600 bg-gray-100 rounded-lg p-3 hover:bg-gray-200 transition-colors duration-200"
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
