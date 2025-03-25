import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { addComment, addReply, deleteComment } from '../../store/commentSlice';

const CommentForm = ({ onSubmit, placeholder = "Write a comment...", buttonText = "Post Comment" }) => {
  const [commentText, setCommentText] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onSubmit(commentText);
      setCommentText('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-3">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={placeholder}
          required
          className="form-control"
          rows="3"
        ></textarea>
      </div>
      <div className="text-end">
        <button type="submit" className="btn btn-primary">
          {buttonText}
        </button>
      </div>
    </form>
  );
};

const Comment = ({ comment, articleId, currentUserId, depth = 0 }) => {
  const dispatch = useDispatch();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Check if current user is the comment author
  const isAuthor = currentUserId && comment.author_id === currentUserId;
  
  // Format date
  const formattedDate = new Date(comment.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  const handleReplySubmit = (replyText) => {
    const replyData = {
      article: articleId,
      content: replyText,
      reply_to: comment.id
    };
    
    dispatch(addReply({ commentId: comment.id, replyData }));
    setShowReplyForm(false);
  };
  
  const handleDelete = () => {
    dispatch(deleteComment(comment.id));
    setShowDeleteConfirm(false);
  };

  // Maximum nesting level to prevent too deep replies
  const maxDepth = 3;
  
  return (
    <div className={`mb-4 ${depth > 0 ? 'ms-4' : ''}`}>
      <div className={`card ${depth % 2 === 0 ? 'border-light' : ''}`}>
        <div className="card-body">
          <div className="d-flex justify-content-between mb-2">
            <h6 className="card-subtitle">
              {comment.author_username}
            </h6>
            <small className="text-muted">{formattedDate}</small>
          </div>
          
          <p className="card-text">{comment.content}</p>
          
          <div className="d-flex">
            {depth < maxDepth && (
              <button 
                onClick={() => setShowReplyForm(!showReplyForm)} 
                className="btn btn-sm btn-link text-decoration-none"
              >
                {showReplyForm ? 'Cancel' : 'Reply'}
              </button>
            )}
            
            {isAuthor && (
              <button 
                onClick={() => setShowDeleteConfirm(true)} 
                className="btn btn-sm btn-link text-danger text-decoration-none ms-2"
              >
                Delete
              </button>
            )}
          </div>
          
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm 
                onSubmit={handleReplySubmit} 
                placeholder="Write a reply..." 
                buttonText="Post Reply"
              />
            </div>
          )}
          
          {showDeleteConfirm && (
            <div className="alert alert-danger mt-3">
              <p className="mb-2">Are you sure you want to delete this comment?</p>
              <div className="d-flex justify-content-end">
                <button 
                  onClick={() => setShowDeleteConfirm(false)} 
                  className="btn btn-sm btn-secondary me-2"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete} 
                  className="btn btn-sm btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies mt-3">
          {comment.replies.map(reply => (
            <Comment 
              key={reply.id} 
              comment={reply} 
              articleId={articleId}
              currentUserId={currentUserId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentSection = ({ articleId, isAuthenticated }) => {
  const dispatch = useDispatch();
  const { comments, isLoading, error } = useSelector(state => state.comments);
  const { user } = useSelector(state => state.auth);
  
  const handleCommentSubmit = (commentText) => {
    const commentData = {
      article: articleId,
      content: commentText
    };
    
    dispatch(addComment(commentData));
  };
  
  return (
    <div className="mt-5">
      <h3 className="mb-4">Comments ({comments.length})</h3>
      
      {isAuthenticated ? (
        <CommentForm onSubmit={handleCommentSubmit} />
      ) : (
        <div className="alert alert-info">
          Please <Link to="/login">login</Link> to leave a comment.
        </div>
      )}
      
      {isLoading && (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading comments...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error.message || 'Error loading comments'}
        </div>
      )}
      
      {comments.length > 0 ? (
        <div className="comments-list">
          {comments.map(comment => (
            <Comment 
              key={comment.id} 
              comment={comment} 
              articleId={articleId}
              currentUserId={user?.id}
            />
          ))}
        </div>
      ) : (
        !isLoading && (
          <p className="text-muted">No comments yet. Be the first to comment!</p>
        )
      )}
    </div>
  );
};

export default CommentSection;