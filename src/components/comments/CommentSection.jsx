import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  fetchComments, 
  addComment, 
  addReply, 
  deleteComment, 
  updateComment 
} from '../../store/commentsSlice';
import { useToastContext } from '../../context/ToastContext';

const CommentForm = ({ onSubmit, placeholder = "Write a comment...", buttonText = "Post Comment", initialValue = "", cancelAction = null }) => {
  const [commentText, setCommentText] = useState(initialValue);
  
  // Reset form when initialValue changes (used for editing)
  useEffect(() => {
    setCommentText(initialValue);
  }, [initialValue]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onSubmit(commentText);
      setCommentText('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <textarea 
          className="form-control"
          rows="3"
          placeholder={placeholder}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          required
        ></textarea>
      </div>
      <div className="d-flex justify-content-end gap-2">
        {cancelAction && (
          <button 
            type="button" 
            className="btn btn-outline-secondary"
            onClick={cancelAction}
          >
            <i className="fas fa-times me-1"></i> Cancel
          </button>
        )}
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={!commentText.trim()}
        >
          <i className="fas fa-paper-plane me-1"></i> {buttonText}
        </button>
      </div>
    </form>
  );
};

const Comment = ({ comment, articleId, currentUserId, depth = 0 }) => {
  const dispatch = useDispatch();
  const { showSuccess, showError } = useToastContext();
  const maxDepth = 2; // Maximum nesting level for replies
  const { user } = useSelector(state => state.auth);
  
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Check permissions
  const isAdmin = user?.is_staff || user?.groups?.includes('management');
  const isAuthor = currentUserId && comment.author_id === currentUserId;
  const canEdit = isAuthor;
  const canDelete = isAdmin || isAuthor;
  
  // Format date
  const formattedDate = new Date(comment.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const handleReplySubmit = (replyText) => {
    const replyData = {
      article: articleId,
      content: replyText,
      reply_to: comment.id
    };
    
    dispatch(addReply({ commentId: comment.id, replyData }))
      .unwrap()
      .then(() => {
        setShowReplyForm(false);
        showSuccess('Reply added successfully');
      })
      .catch(error => {
        showError(error.message || 'Failed to add reply');
      });
  };
  
  const handleEditSubmit = (editedText) => {
    dispatch(updateComment({ commentId: comment.id, content: editedText }))
      .unwrap()
      .then(() => {
        setShowEditForm(false);
        showSuccess('Comment updated successfully');
      })
      .catch(error => {
        showError(error.message || 'Failed to update comment');
      });
  };
  
  const handleDelete = () => {
    dispatch(deleteComment(comment.id))
      .unwrap()
      .then(() => {
        setShowDeleteConfirm(false);
        showSuccess('Comment deleted successfully');
      })
      .catch(error => {
        showError(error.message || 'Failed to delete comment');
        setShowDeleteConfirm(false);
      });
  };
  
  return (
    <div className={`comment-container ${depth > 0 ? 'ms-4 mt-3' : 'mb-4'}`}>
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div className="d-flex align-items-center">
              <div className="comment-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '40px', height: '40px'}}>
                <i className="fas fa-user"></i>
              </div>
              <div>
                <h6 className="mb-0 fw-bold">{comment.author_username}</h6>
                <small className="text-muted">{formattedDate}</small>
              </div>
            </div>
            
            {/* Comment actions menu */}
            <div className="dropdown">
              <button className="btn btn-sm text-muted" type="button" id={`dropdownMenuButton-${comment.id}`} data-bs-toggle="dropdown" aria-expanded="false">
                <i className="fas fa-ellipsis-v"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby={`dropdownMenuButton-${comment.id}`}>
                {depth < maxDepth && (
                  <li>
                    <button 
                      className="dropdown-item" 
                      onClick={() => setShowReplyForm(!showReplyForm)}
                    >
                      <i className="fas fa-reply me-2"></i> Reply
                    </button>
                  </li>
                )}
                
                {canEdit && (
                  <li>
                    <button 
                      className="dropdown-item" 
                      onClick={() => setShowEditForm(true)}
                    >
                      <i className="fas fa-edit me-2"></i> Edit
                    </button>
                  </li>
                )}
                
                {canDelete && (
                  <li>
                    <button 
                      className="dropdown-item text-danger" 
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <i className="fas fa-trash-alt me-2"></i> Delete
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          {/* Comment content or edit form */}
          {showEditForm ? (
            <div className="mb-3">
              <CommentForm 
                onSubmit={handleEditSubmit} 
                placeholder="Edit your comment..." 
                buttonText="Save Changes"
                initialValue={comment.content}
                cancelAction={() => setShowEditForm(false)}
              />
            </div>
          ) : (
            <div className="comment-content mb-3">
              <p className="card-text mb-0">{comment.content}</p>
            </div>
          )}
          
          {/* Quick reply button - outside dropdown for convenience */}
          <div className="d-flex gap-2">
            {depth < maxDepth && !showReplyForm && !showEditForm && (
              <button 
                onClick={() => setShowReplyForm(true)} 
                className="btn btn-sm btn-light"
              >
                <i className="fas fa-reply me-1"></i> Reply
              </button>
            )}
          </div>
          
          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm 
                onSubmit={handleReplySubmit} 
                placeholder="Write a reply..." 
                buttonText="Post Reply"
                cancelAction={() => setShowReplyForm(false)}
              />
            </div>
          )}
          
          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <div className="alert alert-danger mt-3">
              <p className="mb-2"><i className="fas fa-exclamation-triangle me-2"></i> Are you sure you want to delete this comment?</p>
              <div className="d-flex justify-content-end">
                <button 
                  onClick={() => setShowDeleteConfirm(false)} 
                  className="btn btn-sm btn-outline-secondary me-2"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete} 
                  className="btn btn-sm btn-danger"
                >
                  <i className="fas fa-trash-alt me-1"></i> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies">
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
  const { showSuccess, showError } = useToastContext();
  
  // Load comments when component mounts or articleId changes
  useEffect(() => {
    if (articleId) {
      dispatch(fetchComments(articleId))
        .catch(err => {
          console.error('Failed to fetch comments:', err);
        });
    }
    
    // Cleanup when component unmounts
    return () => {
      // No need to clear comments anymore - they should persist in Redux store
    };
  }, [dispatch, articleId]);
  
  const handleCommentSubmit = (commentText) => {
    const commentData = {
      article: articleId,
      content: commentText
    };
    
    dispatch(addComment(commentData))
      .unwrap()
      .then(() => {
        showSuccess('Comment added successfully');
      })
      .catch(error => {
        showError(error.message || 'Failed to add comment');
      });
  };
  
  return (
    <div>
      <h3 className="mb-4">
        <i className="fas fa-comments text-primary me-2"></i>
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>
      
      {isAuthenticated ? (
        <div className="mb-4 p-3 bg-light rounded">
          <h5 className="mb-3">
            <i className="fas fa-pen me-2"></i>
            Leave a Comment
          </h5>
          <CommentForm onSubmit={handleCommentSubmit} />
        </div>
      ) : (
        <div className="alert alert-info d-flex align-items-center mb-4" role="alert">
          <i className="fas fa-info-circle me-2"></i>
          <div>
            Please <Link to="/login" className="alert-link">login</Link> to leave a comment.
          </div>
        </div>
      )}
      
      {isLoading && comments.length === 0 && (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading comments...</span>
          </div>
          <p className="mt-2">Loading comments...</p>
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          <div>{error.message || 'Error loading comments'}</div>
        </div>
      )}
      
      {comments.length > 0 ? (
        <div className="comments-list mt-4">
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
          <div className="text-center p-4 bg-light rounded">
            <i className="fas fa-comment-slash fa-3x text-muted mb-3"></i>
            <p className="mb-0">No comments yet. Be the first to comment!</p>
          </div>
        )
      )}
    </div>
  );
};

export default CommentSection;