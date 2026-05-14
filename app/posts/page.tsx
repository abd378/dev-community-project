"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Post = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
};

type Like = {
  id: string;
  post_id: string;
  user_id: string;
};

type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export default function PostsPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  const [content, setContent] = useState("");
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [userId, setUserId] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserId(user.id);

    await loadPosts();
    await loadLikes();
    await loadComments();

    setLoading(false);
  };

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setPosts(data);
  };

  const loadLikes = async () => {
    const { data, error } = await supabase.from("likes").select("*");

    if (!error && data) setLikes(data);
  };

  const loadComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data) setComments(data);
  };

  const createNotification = async (
    ownerId: string,
    type: string,
    notificationContent: string
  ) => {
    if (!ownerId || ownerId === userId) return;

    await supabase.from("notifications").insert({
      user_id: ownerId,
      sender_id: userId,
      type,
      content: notificationContent,
      is_read: false,
    });

    window.dispatchEvent(new Event("notifications-updated"));
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!content.trim()) return;

    const { error } = await supabase.from("posts").insert({
      user_id: userId,
      content,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setContent("");
    setMessage("Post published successfully.");

    await loadPosts();
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadPosts();
    await loadLikes();
    await loadComments();
  };

  const toggleLike = async (postId: string) => {
    const post = posts.find((item) => item.id === postId);

    const existingLike = likes.find(
      (like) => like.post_id === postId && like.user_id === userId
    );

    if (existingLike) {
      await supabase.from("likes").delete().eq("id", existingLike.id);
    } else {
      const { error } = await supabase.from("likes").insert({
        post_id: postId,
        user_id: userId,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (post) {
        await createNotification(
          post.user_id,
          "like",
          "Someone liked your post."
        );
      }
    }

    await loadLikes();
  };

  const createComment = async (postId: string) => {
    const text = commentText[postId];

    if (!text || !text.trim()) return;

    const post = posts.find((item) => item.id === postId);

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: userId,
      content: text,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    if (post) {
      await createNotification(
        post.user_id,
        "comment",
        "Someone commented on your post."
      );
    }

    setCommentText({
      ...commentText,
      [postId]: "",
    });

    await loadComments();
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadComments();
  };

  const countLikes = (postId: string) => {
    return likes.filter((like) => like.post_id === postId).length;
  };

  const hasLiked = (postId: string) => {
    return likes.some(
      (like) => like.post_id === postId && like.user_id === userId
    );
  };

  const postComments = (postId: string) => {
    return comments.filter((comment) => comment.post_id === postId);
  };

  if (loading) {
    return <main className="posts-page">Loading posts...</main>;
  }

  return (
    <main className="posts-page">
      <section className="posts-card">
        <div className="posts-header">
          <p className="posts-badge">Developer Feed</p>
          <h1>Share your ideas</h1>
          <p>
            Create posts, like updates, comment on ideas, and connect with
            student developers.
          </p>
        </div>

        <form className="post-form" onSubmit={createPost}>
          <textarea
            placeholder="What are you building today?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button type="submit">Publish Post</button>
        </form>

        {message && <p className="post-message">{message}</p>}

        <div className="posts-list">
          {posts.length === 0 ? (
            <p className="empty-posts">No posts yet. Be the first one.</p>
          ) : (
            posts.map((post) => (
              <article className="post-item" key={post.id}>
                <p>{post.content}</p>

                <div className="post-actions">
                  <button
                    type="button"
                    className={hasLiked(post.id) ? "liked-btn" : ""}
                    onClick={() => toggleLike(post.id)}
                  >
                    {hasLiked(post.id) ? "Liked" : "Like"} ·{" "}
                    {countLikes(post.id)}
                  </button>

                  {post.user_id === userId && (
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => deletePost(post.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>

                <div className="comments-section">
                  <h4>Comments</h4>

                  {postComments(post.id).length === 0 ? (
                    <p className="no-comments">No comments yet.</p>
                  ) : (
                    postComments(post.id).map((comment) => (
                      <div className="comment-item" key={comment.id}>
                        <p>{comment.content}</p>

                        <div className="comment-footer">
                          <span>
                            {new Date(comment.created_at).toLocaleString()}
                          </span>

                          {comment.user_id === userId && (
                            <button onClick={() => deleteComment(comment.id)}>
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}

                  <div className="comment-form">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentText[post.id] || ""}
                      onChange={(e) =>
                        setCommentText({
                          ...commentText,
                          [post.id]: e.target.value,
                        })
                      }
                    />

                    <button type="button" onClick={() => createComment(post.id)}>
                      Comment
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}