import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { fetchArticleById, createArticle, updateArticle, clearArticle } from '../store/articlesSlice';

// Validation schema for the article form
const ArticleSchema = Yup.object().shape({
  title: Yup.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters')
    .matches(/^[a-zA-Z]/, 'Title must start with a letter')
    .required('Title is required'),
  content: Yup.string()
    .min(10, 'Content must be at least 10 characters')
    .required('Content is required'),
  tags: Yup.string()
    .nullable()
    .transform(value => value === '' ? null : value),
  status: Yup.string()
    .oneOf(['draft', 'published', 'archived'], 'Invalid status')
    .required('Status is required')
});

const ArticleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { article, isLoading, error } = useSelector(state => state.articles);
  const [isEditMode, setIsEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  useEffect(() => {
    // If ID is provided, we're in edit mode
    if (id) {
      setIsEditMode(true);
      dispatch(fetchArticleById(id));
    } else {
      // Clear any existing article from state in create mode
      dispatch(clearArticle());
    }
    
    // Cleanup function
    return () => {
      dispatch(clearArticle());
    };
  }, [dispatch, id]);
  
  const handleSubmit = (values, { setSubmitting }) => {
    console.log('Form Submit Values:', values);
    
    const formattedValues = {
      ...values,
      tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : []
    };
    
    console.log('Formatted Values:', formattedValues);
    
    const action = isEditMode
      ? updateArticle({ id, articleData: formattedValues })
      : createArticle(formattedValues);
    
    console.log('Dispatching Action:', action);
    
    dispatch(action)
      .unwrap()
      .then((result) => {
        console.log('Article Creation Result:', result);
        setSubmitting(false);
        navigate(`/articles/${result.id}`);
      })
      .catch((err) => {
        console.error('Failed to save article:', err);
        setSubmitting(false);
      });
  };
  
  // Initial form values
  const initialValues = isEditMode && article
    ? {
        title: article.title || '',
        content: article.content || '',
        tags: article.tags ? article.tags.join(', ') : '',
        status: article.status || 'draft'
      }
    : {
        title: '',
        content: '',
        tags: '',
        status: 'draft'
      };
  
  if (isEditMode && isLoading && !article) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading article...</span>
        </div>
        <p className="mt-2">Loading article...</p>
      </div>
    );
  }
  
if (isEditMode && error) {
  return (
    <div className="container py-5">
      <div className="alert alert-danger d-flex align-items-center" role="alert">
        <i className="fas fa-exclamation-circle me-2"></i>
        <div>{error.message || 'Error loading article'}</div>
      </div>
    </div>
  );
}

const [imagePreview, setImagePreview] = useState(null);

const handleImageChange = (event, setFieldValue) => {
  const file = event.currentTarget.files[0];
  if (file) {
    setFieldValue('image', file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }
};
  
  return (
    <div className="bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-4">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/" className="text-decoration-none">
                    <i className="fas fa-home"></i> Home
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/articles" className="text-decoration-none">Articles</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {isEditMode ? 'Edit Article' : 'Create Article'}
                </li>
              </ol>
            </nav>

            <div className="card border-0 shadow">
              <div className="card-header bg-primary text-white p-4">
                <h2 className="mb-0">
                  {isEditMode ? (
                    <><i className="fas fa-edit me-2"></i>Edit Article</>
                  ) : (
                    <><i className="fas fa-plus-circle me-2"></i>Create New Article</>
                  )}
                </h2>
              </div>
              <div className="card-body p-4 p-md-5">
                <Formik
                  initialValues={initialValues}
                  validationSchema={ArticleSchema}
                  onSubmit={handleSubmit}
                  enableReinitialize={true}
                >
                  {({ isSubmitting, touched, errors, values }) => (
                    <Form>
                      {/* Preview / Edit Mode Tabs */}
                      <ul className="nav nav-tabs mb-4">
                        <li className="nav-item">
                          <button 
                            type="button"
                            className={`nav-link ${!previewMode ? 'active' : ''}`} 
                            onClick={() => setPreviewMode(false)}
                          >
                            <i className="fas fa-edit me-2"></i>Edit
                          </button>
                        </li>
                        <li className="nav-item">
                          <button 
                            type="button"
                            className={`nav-link ${previewMode ? 'active' : ''}`}
                            onClick={() => setPreviewMode(true)}
                          >
                            <i className="fas fa-eye me-2"></i>Preview
                          </button>
                        </li>
                      </ul>

                      {previewMode ? (
/* Preview Mode */
<div className="article-preview">
  <div className="border p-4 rounded bg-white mb-4">
    <h1 className="mb-3">{values.title || 'Untitled Article'}</h1>
    <div className="mb-4">
      {values.tags && values.tags.split(',').map((tag, index) => (
        <span key={index} className="badge bg-light text-secondary me-2 mb-2">
          <i className="fas fa-tag me-1"></i> {tag.trim()}
        </span>
      ))}
    </div>
    {imagePreview && (
      <div className="mb-4">
        <img 
          src={imagePreview} 
          alt="Featured" 
          className="img-fluid rounded" 
          style={{ maxHeight: '300px' }}
        />
      </div>
    )}
    <div className="article-content">
      {values.content ? 
        values.content.split('\n').map((paragraph, index) => (
          paragraph ? 
            <p key={index} className="mb-3">{paragraph}</p> : 
            <br key={index} />
        )) : 
        <p className="text-muted fst-italic">No content yet...</p>
      }
    </div>
    <div className="mt-3 p-2 bg-light rounded small">
      <i className="fas fa-info-circle me-1 text-primary"></i>
      Status: <span className="fw-bold">{values.status.charAt(0).toUpperCase() + values.status.slice(1)}</span>
    </div>
  </div>
</div>
                      ) : (
                        /* Edit Mode */
                        <>
                          <div className="mb-4">
                            <label htmlFor="title" className="form-label fw-bold">
                              <i className="fas fa-heading me-2"></i>Title
                            </label>
                            <Field 
                              type="text" 
                              name="title" 
                              id="title" 
                              className={`form-control form-control-lg ${touched.title && errors.title ? 'is-invalid' : ''}`}
                              placeholder="Enter article title" 
                            />
                            <ErrorMessage 
                              name="title" 
                              component="div" 
                              className="invalid-feedback" 
                            />
                          </div>
                          
                          <div className="mb-4">
                            <label htmlFor="content" className="form-label fw-bold">
                              <i className="fas fa-file-alt me-2"></i>Content
                            </label>
                            <Field 
                              as="textarea" 
                              name="content" 
                              id="content" 
                              className={`form-control ${touched.content && errors.content ? 'is-invalid' : ''}`}
                              rows="15"
                              placeholder="Write your article content here..."
                            />
                            <ErrorMessage 
                              name="content" 
                              component="div" 
                              className="invalid-feedback" 
                            />
                            <div className="form-text">
                              <i className="fas fa-lightbulb me-1 text-warning"></i>
                              Tip: Use line breaks to create paragraphs for better readability.
                            </div>
                          </div>
                          
                          <div className="row mb-4">
                            <div className="col-md-8">
                              <label htmlFor="tags" className="form-label fw-bold">
                                <i className="fas fa-tags me-2"></i>Tags (comma separated)
                              </label>
                              <Field 
                                type="text" 
                                name="tags" 
                                id="tags" 
                                className={`form-control ${touched.tags && errors.tags ? 'is-invalid' : ''}`}
                                placeholder="e.g. python, django, tutorial"
                              />
                              <ErrorMessage 
                                name="tags" 
                                component="div" 
                                className="invalid-feedback" 
                              />
                              <div className="form-text">
                                Example: programming, web development, react
                              </div>
                            </div>
                            
                            <div className="col-md-4">
                              <label htmlFor="status" className="form-label fw-bold">
                                <i className="fas fa-toggle-on me-2"></i>Status
                              </label>
                              <Field 
                                as="select" 
                                name="status" 
                                id="status" 
                                className={`form-select ${touched.status && errors.status ? 'is-invalid' : ''}`}
                              >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                              </Field>
                              <ErrorMessage 
                                name="status" 
                                component="div" 
                                className="invalid-feedback" 
                              />
                            </div>
                          </div>
                        </>
                      )}
                      
                      {/* Form Actions */}
                      <div className="d-flex flex-wrap justify-content-between border-top pt-4 mt-4">
                        <button 
                          type="button" 
                          onClick={() => navigate(-1)} 
                          className="btn btn-outline-secondary mb-2"
                        >
                          <i className="fas fa-arrow-left me-1"></i> Cancel
                        </button>
                        
                        <div>
                          {isEditMode && (
                            <Link 
                              to={`/articles/${id}`}
                              className="btn btn-outline-primary me-2 mb-2"
                            >
                              <i className="fas fa-eye me-1"></i> View Article
                            </Link>
                          )}
                          
                          <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="btn btn-primary mb-2"
                          >
                            {isSubmitting ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Saving...
                              </>
                            ) : isEditMode ? (
                              <><i className="fas fa-save me-1"></i>Update Article</>
                            ) : (
                              <><i className="fas fa-paper-plane me-1"></i>Publish Article</>
                            )}
                          </button>
                        </div>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>

            {/* Help Card */}
            <div className="card border-0 shadow-sm mt-4">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="fas fa-lightbulb text-warning me-2"></i>
                  Writing Tips
                </h5>
                <div className="row">
                  <div className="col-md-4 mb-3 mb-md-0">
                    <h6 className="fw-bold">Structure</h6>
                    <ul className="small text-muted ps-3">
                      <li>Use a clear, descriptive title</li>
                      <li>Start with an engaging introduction</li>
                      <li>Organize content with headings</li>
                      <li>End with a strong conclusion</li>
                    </ul>
                  </div>
                  <div className="col-md-4 mb-3 mb-md-0">
                    <h6 className="fw-bold">Content</h6>
                    <ul className="small text-muted ps-3">
                      <li>Focus on quality over quantity</li>
                      <li>Use simple, clear language</li>
                      <li>Back up claims with evidence</li>
                      <li>Use examples to illustrate points</li>
                    </ul>
                  </div>
                  <div className="col-md-4">
                    <h6 className="fw-bold">Tags</h6>
                    <ul className="small text-muted ps-3">
                      <li>Use relevant, specific tags</li>
                      <li>Include topic area tags</li>
                      <li>Add difficulty level tags</li>
                      <li>Limit to 3-5 key tags</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleForm;