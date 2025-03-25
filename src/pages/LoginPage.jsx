import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { loginUser, clearError } from '../store/authSlice';

// Validation schema for the login form
const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required'),
  password: Yup.string()
    .required('Password is required')
});

const LoginPage = () => {
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
    dispatch(loginUser(values))
      .unwrap()
      .then(() => {
        // Redirect to home after successful login
        navigate('/');
      })
      .catch(error => {
        console.error('Login failed:', error);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };
  
  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-6 col-lg-4 mx-auto">
          <div className="card shadow">
            <div className="card-body p-4">
              <h1 className="card-title text-center mb-4">Login</h1>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {typeof error === 'object' && error.non_field_errors 
                    ? error.non_field_errors[0] 
                    : (error.message || 'Invalid credentials. Please try again.')}
                </div>
              )}
              
              <Formik
                initialValues={{ username: '', password: '' }}
                validationSchema={LoginSchema}
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
                    
                    <div className="d-grid gap-2">
                      <button 
                        type="submit" 
                        disabled={isSubmitting || isLoading} 
                        className="btn btn-primary"
                      >
                        {isSubmitting || isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Logging in...
                          </>
                        ) : 'Login'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
              
              <div className="text-center mt-3">
                <p className="mb-0">
                  Don't have an account? <Link to="/register">Register here</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;