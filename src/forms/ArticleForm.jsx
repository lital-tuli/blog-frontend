import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    // Convert tags string to array
    const formattedValues = {
      ...values,
      tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : []
    };
    
    const action = isEditMode
      ? updateArticle({ id, articleData: formattedValues })
      : createArticle(formattedValues);
    
    dispatch(action)
      .unwrap()
      .then((result) => {
        setSubmitting(false);
        // Redirect to the article detail page
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
        <div className="alert alert-danger" role="alert">
          {error.message || 'Error loading article'}
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
              <h1 className="card-title text-center mb-4">
                {isEditMode ? 'Edit Article' : 'Create New Article'}
              </h1>
              
              <Formik
                initialValues={initialValues}
                validationSchema={ArticleSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">Title</label>
                      <Field 
                        type="text" 
                        name="title" 
                        id="title" 
                        className="form-control" 
                      />
                      <ErrorMessage 
                        name="title" 
                        component="div" 
                        className="text-danger small mt-1" 
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="content" className="form-label">Content</label>
                      <Field 
                        as="textarea" 
                        name="content" 
                        id="content" 
                        className="form-control" 
                        rows="15"
                      />
                      <ErrorMessage 
                        name="content" 
                        component="div" 
                        className="text-danger small mt-1" 
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="tags" className="form-label">Tags (comma separated)</label>
                      <Field 
                        type="text" 
                        name="tags" 
                        id="tags" 
                        className="form-control" 
                      />
                      <ErrorMessage 
                        name="tags" 
                        component="div" 
                        className="text-danger small mt-1" 
                      />
                      <div className="form-text">
                        Example: programming, web development, react
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="status" className="form-label">Status</label>
                      <Field 
                        as="select" 
                        name="status" 
                        id="status" 
                        className="form-select"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </Field>
                      <ErrorMessage 
                        name="status" 
                        component="div" 
                        className="text-danger small mt-1" 
                      />
                    </div>
                    
                    <div className="d-flex justify-content-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => navigate(-1)} 
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
                        ) : (isEditMode ? 'Update Article' : 'Create Article')}
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
  );
};

export default ArticleForm;