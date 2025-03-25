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
      <div className="row">
        <div className="col-md-6 mx-auto">
          <div className="card shadow">
            <div className="card-body p-4">
              <h1 className="card-title text-center mb-4">Create an Account</h1>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {typeof error === 'object' 
                    ? Object.keys(error).map(key => (
                        <div key={key}><strong>{key}:</strong> {error[key]}</div>
                      ))
                    : (error.message || 'Registration failed. Please try again.')}
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
                {({ isSubmitting }) => (
                  <Form>
                    <div className="mb-3">
                      <label htmlFor="username" className="form-label">Username</label>
                      <Field 
                        type="text" 
                        name="username" 
                        id="username" 
                        className="form-control" 
                      />
                      <ErrorMessage 
                        name="username" 
                        component="div" 
                        className="text-danger small mt-1" 
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <Field 
                        type="email" 
                        name="email" 
                        id="email" 
                        className="form-control" 
                      />
                      <ErrorMessage 
                        name="email" 
                        component="div" 
                        className="text-danger small mt-1" 
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Password</label>
                      <Field 
                        type="password" 
                        name="password" 
                        id="password" 
                        className="form-control" 
                      />
                      <ErrorMessage 
                        name="password" 
                        component="div" 
                        className="text-danger small mt-1" 
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                      <Field 
                        type="password" 
                        name="confirmPassword" 
                        id="confirmPassword" 
                        className="form-control" 
                      />
                      <ErrorMessage 
                        name="confirmPassword" 
                        component="div" 
                        className="text-danger small mt-1" 
                      />
                    </div>
                    
                    <div className="d-grid gap-2">
                      <button 
                        type="submit" 
                        disabled={isSubmitting || isLoading} 
                        className="btn btn-primary"
                      >
                        {isSubmitting || isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Registering...
                          </>
                        ) : 'Register'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
              
              <div className="text-center mt-3">
                <p className="mb-0">
                  Already have an account? <Link to="/login">Login here</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;