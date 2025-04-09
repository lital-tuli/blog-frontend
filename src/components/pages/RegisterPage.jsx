// src/pages/RegisterPage.jsx
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { registerUser, clearError } from '../store/authSlice';

// Validation schema for registration form
const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password')
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, error } = useSelector(state => state.auth);
  
  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    
    // Clear any previous errors
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);
  
  const handleSubmit = (values, { setSubmitting }) => {
    // Extract the data needed for registration
    const { username, email, password } = values;
    
    dispatch(registerUser({ username, email, password }))
      .unwrap()
      .then(() => {
        // Redirect to home after successful registration
        navigate('/');
      })
      .catch(error => {
        console.error('Registration failed:', error);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };
  
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <div className="card border-0 shadow">
            <div className="row g-0">
              <div className="col-md-5 bg-primary text-white d-flex flex-column justify-content-center align-items-center py-5">
                <div className="text-center p-4">
                  <i className="fas fa-user-plus fa-4x mb-3"></i>
                  <h2 className="fw-bold">Join Us</h2>
                  <p className="mb-4">Create an account to start writing articles and join our community.</p>
                  <div className="d-flex justify-content-center">
                    <div className="border-bottom border-white w-25 mb-4"></div>
                  </div>
                  <p className="mb-0">Already have an account?</p>
                  <Link to="/login" className="btn btn-outline-light mt-2">
                    <i className="fas fa-sign-in-alt me-2"></i>Login
                  </Link>
                </div>
              </div>
              <div className="col-md-7">
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <h2 className="fw-bold">Create Account</h2>
                    <p className="text-muted">Fill out the form to get started</p>
                  </div>
              
{error && (
  <div className="alert alert-danger d-flex align-items-center" role="alert">
    <i className="fas fa-exclamation-circle me-2"></i>
    <div>
      {typeof error === 'object' 
        ? Object.keys(error).map(key => (
            <div key={key}>
              <strong>{key}:</strong> {Array.isArray(error[key]) ? error[key][0] : error[key]}
            </div>
          ))
        : (error.message || 'Registration failed. Please try again.')}
    </div>
  </div>
)}
              
                  <Formik
                    initialValues={{ 
                      username: '', 
                      email: '', 
                      password: '', 
                      confirmPassword: '' 
                    }}
                    validationSchema={RegisterSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ isSubmitting, touched, errors }) => (
                      <Form>
                        <div className="mb-3">
                          <label htmlFor="username" className="form-label">
                            <i className="fas fa-user me-2"></i>Username
                          </label>
                          <Field 
                            type="text" 
                            name="username" 
                            id="username" 
                            className={`form-control ${touched.username && errors.username ? 'is-invalid' : ''}`}
                            placeholder="Choose a username"
                          />
                          <ErrorMessage 
                            name="username" 
                            component="div" 
                            className="invalid-feedback" 
                          />
                        </div>
                    
                        <div className="mb-3">
                          <label htmlFor="email" className="form-label">
                            <i className="fas fa-envelope me-2"></i>Email
                          </label>
                          <Field 
                            type="email" 
                            name="email" 
                            id="email" 
                            className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`}
                            placeholder="Enter your email address"
                          />
                          <ErrorMessage 
                            name="email" 
                            component="div" 
                            className="invalid-feedback" 
                          />
                        </div>
                    
                        <div className="mb-3">
                          <label htmlFor="password" className="form-label">
                            <i className="fas fa-lock me-2"></i>Password
                          </label>
                          <Field 
                            type="password" 
                            name="password" 
                            id="password" 
                            className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`}
                            placeholder="Create a password"
                          />
                          <ErrorMessage 
                            name="password" 
                            component="div" 
                            className="invalid-feedback" 
                          />
                        </div>
                    
                        <div className="mb-4">
                          <label htmlFor="confirmPassword" className="form-label">
                            <i className="fas fa-check-circle me-2"></i>Confirm Password
                          </label>
                          <Field 
                            type="password" 
                            name="confirmPassword" 
                            id="confirmPassword" 
                            className={`form-control ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`}
                            placeholder="Confirm your password"
                          />
                          <ErrorMessage 
                            name="confirmPassword" 
                            component="div" 
                            className="invalid-feedback" 
                          />
                        </div>
                    
                        <div className="d-grid">
                          <button 
                            type="submit" 
                            disabled={isSubmitting || isLoading} 
                            className="btn btn-primary"
                          >
                            {isSubmitting || isLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Creating Account...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-user-plus me-2"></i>Create Account
                              </>
                            )}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;