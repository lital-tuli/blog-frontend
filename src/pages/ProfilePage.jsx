import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { fetchCurrentUserProfile, fetchProfile, updateProfile, clearError } from '../store/profileSlice';
import { fetchArticles } from '../store/articlesSlice';
import ArticleCard from '../components/ArticleCard';

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
    return <div className="loading">Loading profile...</div>;
  }
  
  if (profileError) {
    return <div className="error-message">{profileError.message}</div>;
  }
  
  if (!profile) {
    return <div className="not-found">Profile not found</div>;
  }
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.profile_pic ? (
            <img 
              src={profile.profile_pic} 
              alt={`${profile.username}'s profile`} 
              className="avatar-image" 
            />
          ) : (
            <div className="avatar-placeholder">
              {profile.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="profile-info">
          <h1>{profile.username}</h1>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          
          {profile.birth_date && (
            <p className="profile-birth-date">
              <strong>Birth Date:</strong> {new Date(profile.birth_date).toLocaleDateString()}
            </p>
          )}
          
          <p className="profile-joined-date">
            <strong>Joined:</strong> {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
        
        {isCurrentUser && !isEditMode && (
          <button 
            onClick={() => setIsEditMode(true)} 
            className="edit-profile-button"
          >
            Edit Profile
          </button>
        )}
      </div>
      
      {isEditMode && (
        <div className="profile-edit-container">
          <h2>Edit Profile</h2>
          
          <Formik
            initialValues={{
              bio: profile.bio || '',
              birth_date: profile.birth_date || ''
            }}
            validationSchema={ProfileSchema}
            onSubmit={handleProfileUpdate}
          >
            {({ isSubmitting }) => (
              <Form className="profile-edit-form">
                <div className="form-group">
                  <label htmlFor="profile_pic">Profile Picture</label>
                  <input
                    type="file"
                    id="profile_pic"
                    name="profile_pic"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="form-control"
                  />
                  {uploadedImage && (
                    <div className="image-preview">
                      <img 
                        src={URL.createObjectURL(uploadedImage)} 
                        alt="Profile preview" 
                        className="preview-image" 
                      />
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <Field
                    as="textarea"
                    name="bio"
                    id="bio"
                    className="form-control"
                    rows="4"
                  />
                  <ErrorMessage name="bio" component="div" className="error" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="birth_date">Birth Date</label>
                  <Field
                    type="date"
                    name="birth_date"
                    id="birth_date"
                    className="form-control"
                  />
                  <ErrorMessage name="birth_date" component="div" className="error" />
                </div>
                
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="save-button"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}
      
      <div className="profile-articles">
        <h2>Articles</h2>
        
        {articlesLoading ? (
          <div className="loading">Loading articles...</div>
        ) : articles.length > 0 ? (
          <div className="articles-grid">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="no-articles">No articles published yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;