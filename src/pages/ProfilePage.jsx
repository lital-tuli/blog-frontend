import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { fetchCurrentUserProfile, fetchProfile, updateProfile, clearError } from '../store/profileSlice';
import { fetchArticles } from '../store/articlesSlice';
import ArticleCard from '../components/articles/ArticleCard';
import { useToastContext } from '../context/ToastContext';

// Validation schema for profile update
const ProfileSchema = Yup.object().shape({
  bio: Yup.string()
    .max(1000, 'Bio must be less than 1000 characters'),
  birth_date: Yup.date()
    .nullable()
    .transform((value) => (value === '' ? null : value))
});
const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useToastContext();
  
  const { profile, isLoading: profileLoading, error: profileError } = useSelector(state => state.profile);
  const { articles, isLoading: articlesLoading } = useSelector(state => state.articles);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // If no ID is provided, load current user's profile
  const isCurrentUser = !id || (user && user.id.toString() === id);
  
  useEffect(() => {
    // Clear any previous errors
    dispatch(clearError());
    
    // Load profile based on ID or current user
    if (!id || id === 'undefined') {
      // If no ID or ID is 'undefined', fetch current user's profile
      dispatch(fetchCurrentUserProfile());
    } else {
      // Ensure id is a valid number before dispatching
      const userId = parseInt(id, 10);
      if (!isNaN(userId)) {
        dispatch(fetchProfile(userId));
      } else {
        // Handle invalid ID scenario
        dispatch(clearError());
        showError('Invalid profile ID');
        navigate('/');
      }
    }
    
    // Load user's articles
    if (id) {
      dispatch(fetchArticles({ author: id }));
    } else if (user) {
      dispatch(fetchArticles({ author: user.id }));
    }
  }, [dispatch, id, user, navigate, showError]);
  
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUploadedImage(file);
      
      // Create preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };
  
  const handleProfileUpdate = (values, { setSubmitting }) => {
    // Create a FormData object to send both text fields and file
    const formData = new FormData();
    
    // Add text fields
    Object.keys(values).forEach(key => {
      if (values[key] !== null && values[key] !== undefined) {
        formData.append(key, values[key]);
      }
    });
    
    // Add profile image if uploaded
    if (uploadedImage) {
      formData.append('profile_pic', uploadedImage);
    }
    
    // Dispatch update action
    dispatch(updateProfile({ profileId: profile.id || user.id, profileData: formData }))
      .unwrap()
      .then(() => {
        // Reset state
        setIsEditMode(false);
        setUploadedImage(null);
        setPreviewUrl(null);
        
        // Show success message
        showSuccess('Profile updated successfully');
        
        // Redirect to profile page
        navigate(`/profile/${profile.user}`);
      })
      .catch(error => {
        console.error('Failed to update profile:', error);
        
        // Show error message
        if (error.response?.data) {
          const messages = Object.values(error.response.data).flat();
          showError(messages.join(' '));
        } else {
          showError(error.message || 'Failed to update profile');
        }
      })
      .finally(() => {
        setSubmitting(false);
      });
  };
  
  
  if (profileLoading && !profile) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading profile...</p>
      </div>
    );
  }
  
  if (profileError) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          <div>{profileError.message || 'Error loading profile'}</div>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning d-flex align-items-center" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <div>Profile not found.</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-light py-5">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 mb-4">
            {/* Profile Card */}
            <div className="card border-0 shadow">
              <div className={`card-header text-white p-4 text-center ${isCurrentUser ? 'bg-primary' : 'bg-secondary'}`}>
                <div className="mb-3">
                  {profile.profile_pic || previewUrl ? (
                    <img 
                      src={previewUrl || profile.profile_pic} 
                      alt={`${profile.username}'s profile`} 
                      className="rounded-circle img-thumbnail" 
                      style={{ width: '150px', height: '150px', objectFit: 'cover', border: '4px solid white' }}
                    />
                  ) : (
                    <div 
                      className="rounded-circle bg-light text-primary d-flex align-items-center justify-content-center mx-auto"
                      style={{ width: '150px', height: '150px', fontSize: '60px', border: '4px solid white' }}
                    >
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                </div>
                <h3 className="fs-4 fw-bold">{profile.username}</h3>
                {isCurrentUser && !isEditMode && (
                  <button 
                    onClick={() => setIsEditMode(true)} 
                    className="btn btn-sm btn-outline-light mt-2"
                  >
                    <i className="fas fa-edit me-1"></i> Edit Profile
                  </button>
                )}
              </div>
              
              <div className="card-body p-4">
                {isEditMode ? (
                  <Formik
                    initialValues={{
                      bio: profile.bio || '',
                      birth_date: profile.birth_date || ''
                    }}
                    validationSchema={ProfileSchema}
                    onSubmit={handleProfileUpdate}
                  >
                    {({ isSubmitting, touched, errors }) => (
                      <Form>
                        <h5 className="card-title mb-3">
                          <i className="fas fa-edit me-2"></i>Edit Profile
                        </h5>
                        <div className="mb-3">
                          <label htmlFor="profile_pic" className="form-label">Profile Picture</label>
                          <input
                            type="file"
                            id="profile_pic"
                            name="profile_pic"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="form-control"
                          />
                          {previewUrl && (
                            <div className="mt-2 text-center">
                              <img 
                                src={previewUrl} 
                                alt="Profile preview" 
                                className="rounded-circle"
                                style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="mb-3">
                          <label htmlFor="bio" className="form-label">Bio</label>
                          <Field
                            as="textarea"
                            name="bio"
                            id="bio"
                            className={`form-control ${touched.bio && errors.bio ? 'is-invalid' : ''}`}
                            rows="4"
                          />
                          <ErrorMessage name="bio" component="div" className="invalid-feedback" />
                        </div>
                        
                        <div className="mb-3">
                          <label htmlFor="birth_date" className="form-label">Birth Date</label>
                          <Field
                            type="date"
                            name="birth_date"
                            id="birth_date"
                            className={`form-control ${touched.birth_date && errors.birth_date ? 'is-invalid' : ''}`}
                          />
                          <ErrorMessage name="birth_date" component="div" className="invalid-feedback" />
                        </div>
                        
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditMode(false);
                              setPreviewUrl(null);
                              setUploadedImage(null);
                            }}
                            className="btn btn-secondary"
                          >
                            <i className="fas fa-times me-1"></i> Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary"
                          >
                            {isSubmitting ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Saving...
                              </>
                            ) : (
                              <><i className="fas fa-save me-1"></i> Save Changes</>
                            )}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                ) : (
                  <>
                    {profile.bio ? (
                      <>
                        <h5 className="card-title mb-3">
                          <i className="fas fa-info-circle me-2"></i>About
                        </h5>
                        <p className="card-text mb-4">{profile.bio}</p>
                      </>
                    ) : (
                      <p className="text-muted fst-italic mb-4">
                        {isCurrentUser ? 'Add a bio to tell others about yourself...' : 'No bio available.'}
                      </p>
                    )}
                    
                    <div className="user-info">
                      <ul className="list-group list-group-flush">
                        {profile.birth_date && (
                          <li className="list-group-item px-0 d-flex align-items-center">
                            <i className="fas fa-birthday-cake text-primary me-2"></i>
                            <span>Born: {new Date(profile.birth_date).toLocaleDateString()}</span>
                          </li>
                        )}
                        <li className="list-group-item px-0 d-flex align-items-center">
                          <i className="fas fa-calendar-alt text-primary me-2"></i>
                          <span>Joined: {new Date(profile.created_at).toLocaleDateString()}</span>
                        </li>
                        <li className="list-group-item px-0 d-flex align-items-center">
                          <i className="fas fa-newspaper text-primary me-2"></i>
                          <span>Articles: {articles?.length || 0}</span>
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Social Links Card - For Visual Enhancement */}
            {!isEditMode && (
              <div className="card border-0 shadow mt-4">
                <div className="card-body p-4">
                  <h5 className="card-title mb-3">
                    <i className="fas fa-share-alt me-2"></i>Connect
                  </h5>
                  <div className="d-flex justify-content-around">
                    <a href="#" className="btn btn-outline-primary">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="#" className="btn btn-outline-primary">
                      <i className="fab fa-linkedin"></i>
                    </a>
                    <a href="#" className="btn btn-outline-primary">
                      <i className="fab fa-github"></i>
                    </a>
                    <a href="#" className="btn btn-outline-primary">
                      <i className="fas fa-globe"></i>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="col-lg-8">
            {/* User's Articles Section */}
            <div className="card border-0 shadow">
              <div className="card-header bg-white p-4 d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  <i className="fas fa-newspaper text-primary me-2"></i>
                  {isCurrentUser ? 'My Articles' : `${profile.username}'s Articles`}
                </h4>
                
                {isCurrentUser && (
                  <Link to="/articles/new" className="btn btn-primary">
                    <i className="fas fa-plus-circle me-1"></i> New Article
                  </Link>
                )}
              </div>
              
              <div className="card-body p-4">
                {articlesLoading ? (
                  <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading articles...</span>
                    </div>
                    <p className="mt-2">Loading articles...</p>
                  </div>
                ) : articles.length > 0 ? (
                  <div className="row row-cols-1 g-4">
                    {articles.map(article => (
                      <div key={article.id} className="col">
                        <ArticleCard article={article} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
                    <h5>No articles published yet</h5>
                    {isCurrentUser && (
                      <p className="text-muted">
                        Ready to share your thoughts?{' '}
                        <Link to="/articles/new" className="btn btn-sm btn-primary mt-2">
                          <i className="fas fa-pen me-1"></i> Write Your First Article
                        </Link>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;