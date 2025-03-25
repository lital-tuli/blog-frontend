// src/pages/ProfilePage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { fetchCurrentUserProfile, fetchProfile, updateProfile, clearError } from '../store/profileSlice';
import { fetchArticles } from '../store/articlesSlice';
import ArticleCard from '../components/articles/ArticleCard';

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
  const { profile, isLoading: profileLoading, error: profileError } = useSelector(state => state.profile);
  const { articles, isLoading: articlesLoading } = useSelector(state => state.articles);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  
  // If no ID is provided, load current user's profile
  const isCurrentUser = !id || (user && user.id.toString() === id);
  
  useEffect(() => {
    // Clear any previous errors
    dispatch(clearError());
    
    // Load profile based on ID or current user
    if (isCurrentUser) {
      dispatch(fetchCurrentUserProfile());
    } else if (id) {
      dispatch(fetchProfile(id));
    }
    
    // Load user's articles
    if (id) {
      dispatch(fetchArticles({ author: id }));
    } else if (user) {
      dispatch(fetchArticles({ author: user.id }));
    }
  }, [dispatch, id, user, isCurrentUser]);
  
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setUploadedImage(event.target.files[0]);
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
    dispatch(updateProfile({ profileId: profile.id, profileData: formData }))
      .unwrap()
      .then(() => {
        setIsEditMode(false);
        setUploadedImage(null);
      })
      .catch(error => {
        console.error('Failed to update profile:', error);
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
        <div className="alert alert-danger" role="alert">
          {profileError.message || 'Error loading profile'}
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning" role="alert">
          Profile not found.
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card shadow">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                {profile.profile_pic ? (
                  <img 
                    src={profile.profile_pic} 
                    alt={`${profile.username}'s profile`} 
                    className="rounded-circle" 
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto"
                    style={{ width: '150px', height: '150px', fontSize: '48px' }}
                  >
                    {profile.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <h2 className="mt-3">{profile.username}</h2>
                {profile.bio && <p className="mt-2">{profile.bio}</p>}
                
                {profile.birth_date && (
                  <p className="mb-1">
                    <strong>Birth Date:</strong> {new Date(profile.birth_date).toLocaleDateString()}
                  </p>
                )}
                
                <p className="text-muted">
                  <strong>Joined:</strong> {new Date(profile.created_at).toLocaleDateString()}
                </p>
                
                {isCurrentUser && !isEditMode && (
                  <button 
                    onClick={() => setIsEditMode(true)} 
                    className="btn btn-outline-primary"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
              
              {isEditMode && (
                <div className="mt-4">
                  <h3 className="mb-3">Edit Profile</h3>
                  
                  <Formik
                    initialValues={{
                      bio: profile.bio || '',
                      birth_date: profile.birth_date || ''
                    }}
                    validationSchema={ProfileSchema}
                    onSubmit={handleProfileUpdate}
                  >
                    {({ isSubmitting }) => (
                      <Form>
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
                          {uploadedImage && (
                            <div className="mt-2">
                              <img 
                                src={URL.createObjectURL(uploadedImage)} 
                                alt="Profile preview" 
                                className="rounded"
                                style={{ maxWidth: '100%', maxHeight: '200px' }}
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
                            className="form-control"
                            rows="4"
                          />
                          <ErrorMessage name="bio" component="div" className="text-danger mt-1" />
                        </div>
                        
                        <div className="mb-3">
                          <label htmlFor="birth_date" className="form-label">Birth Date</label>
                          <Field
                            type="date"
                            name="birth_date"
                            id="birth_date"
                            className="form-control"
                          />
                          <ErrorMessage name="birth_date" component="div" className="text-danger mt-1" />
                        </div>
                        
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            onClick={() => setIsEditMode(false)}
                            className="btn btn-secondary"
                          >
                            Cancel
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
                            ) : 'Save Changes'}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              )}
              
              <div className="mt-5">
                <h3 className="mb-4">Articles</h3>
                
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
                  <p className="text-muted">No articles published yet.</p>
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