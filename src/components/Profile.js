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
  const [mediaCommentTexts, setMediaCommentTexts] = useState({});
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

  // Function to fetch replies for a specific comment
  const fetchCommentReplies = async (commentId) => {
    try {
      const repliesData = await instagramService.getCommentReplies(
        commentId,
        token
      );
      return repliesData.data || [];
    } catch (err) {
      console.error("Error fetching replies:", err);
      return [];
    }
  };

  // Function to toggle showing replies for a comment
  const toggleReplies = async (mediaId, commentId) => {
    // If comment already has replies loaded, just toggle visibility
    const comment = mediaComments[mediaId]?.find((c) => c.id === commentId);

    if (comment && !comment.repliesLoaded) {
      try {
        const replies = await fetchCommentReplies(commentId);

        setMediaComments((prev) => ({
          ...prev,
          [mediaId]: prev[mediaId].map((c) =>
            c.id === commentId
              ? { ...c, replies, repliesLoaded: true, showReplies: true }
              : c
          ),
        }));
      } catch (err) {
        setError("Failed to load replies");
      }
    } else {
      // Just toggle visibility of already loaded replies
      setMediaComments((prev) => ({
        ...prev,
        [mediaId]: prev[mediaId].map((c) =>
          c.id === commentId ? { ...c, showReplies: !c.showReplies } : c
        ),
      }));
    }
  };

  const handleComment = async (mediaId) => {
    const commentText = mediaCommentTexts[mediaId];
    if (!commentText?.trim()) return;

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
      setMediaCommentTexts((prev) => ({ ...prev, [mediaId]: "" }));
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
          <p className="text-purple-600 font-medium animate-pulse">
            Loading your Instagram data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
        <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm border border-red-100 rounded-xl p-8 shadow-xl max-w-md w-full">
          <div className="flex items-center justify-center mb-4 text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-center text-gray-800 mb-2">
            Authentication Error
          </h3>
          <p className="text-red-600 text-center mb-6 font-medium">{error}</p>
          <button
            onClick={() => {
              setError(null);
              login();
            }}
            className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-red-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
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
        <div className="bg-white rounded-xl shadow-lg p-8 mb-10 flex flex-col md:flex-row items-center md:items-start gap-8 border border-gray-100 backdrop-filter backdrop-blur-sm bg-opacity-90 transform transition-all hover:shadow-xl">
          <div className="relative">
            {profile.profile_picture ? (
              <img
                src={profile.profile_picture}
                alt={`${profile.username}'s profile`}
                className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-purple-500 shadow-md p-1 bg-white"
              />
            ) : (
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-md">
                {profile.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-md">
              {profile.media_count}
            </div>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              @{profile.username}
            </h1>
            <div className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-4">
              {profile.account_type}
            </div>
            <p className="text-gray-600 max-w-md">
              Manage your Instagram content and engage with your audience all in
              one place.
            </p>
          </div>
        </div>
      )}

      {/* Media Feed */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b border-gray-200 pb-2">
        Your Media
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {media.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            {/* Media Content */}
            <div className="aspect-w-1 aspect-h-1 relative group">
              {item.media_type === "VIDEO" ? (
                <>
                  <video
                    src={item.media_url}
                    controls
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-md">
                    VIDEO
                  </div>
                </>
              ) : (
                <>
                  <img
                    src={item.media_url}
                    alt={item.caption}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </>
              )}
            </div>

            {/* Caption and Comments */}
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <p className="text-gray-800 font-medium line-clamp-2">
                  {item.caption || "No caption"}
                </p>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {new Date(item.timestamp).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex space-x-2 mb-4">
                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  #{item.media_type?.toLowerCase() || "post"}
                </span>
              </div>

              {/* Comments Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1 text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Comments
                  </h3>
                  <span className="text-xs text-gray-500">
                    {mediaComments[item.id]?.length || 0} comments
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {mediaComments[item.id]?.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <p className="text-sm text-gray-800 font-medium">
                        {comment.text}
                      </p>
                      {/* Show replies button */}
                      <div className="flex justify-between items-center mt-2 mb-1">
                        {comment.replies && comment.replies.length > 0 && (
                          <button
                            onClick={() => toggleReplies(item.id, comment.id)}
                            className="text-xs text-purple-600 flex items-center hover:text-purple-800 transition-colors"
                          >
                            {comment.showReplies ? (
                              <>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 mr-1"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Hide {comment.replies.length}{" "}
                                {comment.replies.length === 1
                                  ? "reply"
                                  : "replies"}
                              </>
                            ) : (
                              <>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 mr-1"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                View {comment.replies.length}{" "}
                                {comment.replies.length === 1
                                  ? "reply"
                                  : "replies"}
                              </>
                            )}
                          </button>
                        )}

                        {activeCommentId !== comment.id && (
                          <button
                            onClick={() => setActiveCommentId(comment.id)}
                            className="text-xs text-pink-500 hover:text-pink-700 transition-colors font-medium"
                          >
                            Reply
                          </button>
                        )}
                      </div>

                      {/* Replies section */}
                      {comment.showReplies &&
                        comment.replies &&
                        comment.replies.length > 0 && (
                          <div className="mt-2 pl-4 space-y-2 border-l-2 border-purple-200">
                            {comment.replies.map((reply) => (
                              <div
                                key={reply.id}
                                className="text-sm text-gray-600 bg-gray-100 rounded-md p-2 border border-gray-200 shadow-sm"
                              >
                                <p className="text-xs text-purple-600 mb-1 font-medium">
                                  Reply
                                </p>
                                {reply.text}
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Reply Form */}
                      {activeCommentId === comment.id && (
                        <div className="mt-3 pl-4 border-l-2 border-pink-200">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Write a reply..."
                              className="w-full p-2 pr-20 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-all"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                            />
                            <button
                              onClick={() => handleReply(item.id)}
                              className="absolute right-1 top-1 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm"
                              disabled={!replyText.trim()}
                            >
                              Reply
                            </button>
                          </div>
                          <button
                            onClick={() => setActiveCommentId(null)}
                            className="text-xs text-gray-500 mt-1 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* New Comment Form */}
                <div className="mt-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      className="w-full p-3 pr-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition-all"
                      value={mediaCommentTexts[item.id] || ""}
                      onChange={(e) =>
                        setMediaCommentTexts((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                    />
                    <button
                      onClick={() => handleComment(item.id)}
                      className="absolute right-1 top-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!mediaCommentTexts[item.id]?.trim()}
                    >
                      <span className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Post
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
