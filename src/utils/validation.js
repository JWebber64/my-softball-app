import * as yup from 'yup';

// Validation schemas
export const schemas = {
  news: yup.object().shape({
    title: yup.string().required('Title is required').max(200),
    content: yup.string().required('Content is required').max(2000),
  }),
  
  player: yup.object().shape({
    firstName: yup.string().required('First name is required').max(50),
    lastName: yup.string().required('Last name is required').max(50),
    number: yup.string().required('Number is required')
      .matches(/^\d{1,2}$/, 'Number must be 1-2 digits'),
    position: yup.string().required('Position is required'),
    status: yup.string().oneOf(['active', 'inactive', 'injured']),
  }),
  
  game: yup.object().shape({
    date: yup.date().required('Date is required'),
    opponent: yup.string().required('Opponent is required'),
    location: yup.string().required('Location is required'),
    score: yup.object().shape({
      us: yup.number().min(0),
      them: yup.number().min(0),
    }),
  }),
};

export const validateData = async (type, data) => {
  try {
    const schema = schemas[type];
    if (!schema) throw new Error(`No validation schema for type: ${type}`);
    
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: null };
  } catch (error) {
    return {
      isValid: false,
      errors: error.inner.reduce((acc, err) => ({
        ...acc,
        [err.path]: err.message
      }), {})
    };
  }
};