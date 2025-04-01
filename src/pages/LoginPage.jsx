import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { loginUser, clearError } from '../store/authSlice';

// Validation schema
const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required')
});

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, error } = useSelector(state => state.auth);
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);
  
  const handleSubmit = (values, { setSubmitting }) => {
    dispatch(loginUser(values))
      .unwrap()
      .then(() => {
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
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <div className="card border-0 shadow">
            <div className="row g-0">
              <div className="col-md-5 bg-primary text-white d-flex flex-column justify-content-center align-items-center py-5">
                <div className="text-center p-4">
                  <i className="fas fa-user-circle fa-4x mb-3"></i>
                  <h2 className="fw-bold">Welcome</h2>
                  <p className="mb-4">Access your account to enjoy all the features of our blog platform.</p>
                  <div className="d-flex justify-content-center">
                    <div className="border-bottom border-white w-25 mb-4"></div>
                  </div>
                  <p className="mb-0">Don't have an account?</p>
                  <Link to="/register" className="btn btn-outline-light mt-2">
                    <i className="fas fa-user-plus me-2"></i>Register
                  </Link>
                </div>
              </div>
              <div className="col-md-7">
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <h2 className="fw-bold">Sign In</h2>
                    <p className="text-muted">Access your account</p>
                  </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  <div>
                    {typeof error === 'object' && error.non_field_errors 
                      ? error.non_field_errors[0] 
                      : (error.message || 'Invalid credentials. Please try again.')}
                  </div>
                </div>
              )}
              
              <Formik
                initialValues={{ username: '', password: '' }}
                validationSchema={LoginSchema}
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
                        className={`form-control form-control-lg ${touched.username && errors.username ? 'is-invalid' : ''}`}
                        placeholder="Enter your username" 
                      />
                      <ErrorMessage 
                        name="username" 
                        component="div" 
                        className="invalid-feedback" 
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="password" className="form-label">
                        <i className="fas fa-lock me-2"></i>Password
                      </label>
                      <Field 
                        type="password" 
                        name="password" 
                        id="password" 
                        className={`form-control form-control-lg ${touched.password && errors.password ? 'is-invalid' : ''}`}
                        placeholder="Enter your password" 
                      />
                      <ErrorMessage 
                        name="password" 
                        component="div" 
                        className="invalid-feedback" 
                      />
                    </div>
                    
                    <div className="d-grid mb-4">
                      <button 
                        type="submit" 
                        disabled={isSubmitting || isLoading} 
                        className="btn btn-primary btn-lg"
                      >
                        {isSubmitting || isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Signing in...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-sign-in-alt me-2"></i>Sign In
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

          {/* Test User Information Card */}
          <div className="card mt-4 border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-info-circle text-primary me-2"></i>
                Test Accounts
              </h5>
              <div className="row">
                <div className="col-sm-4">
                  <div className="mb-2 fw-bold">Regular User:</div>
                  <div className="small text-muted mb-1">Username: user</div>
                  <div className="small text-muted">Password: user1234</div>
                </div>
                <div className="col-sm-4">
                  <div className="mb-2 fw-bold">Editor:</div>
                  <div className="small text-muted mb-1">Username: editor</div>
                  <div className="small text-muted">Password: editor1234</div>
                </div>
                <div className="col-sm-4">
                  <div className="mb-2 fw-bold">Admin:</div>
                  <div className="small text-muted mb-1">Username: admin</div>
                  <div className="small text-muted">Password: admin1234</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;