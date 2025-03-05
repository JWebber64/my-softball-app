import * as yup from 'yup';

const phoneRegExp = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

export const signupSchemas = {
  user: yup.object({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number'),
    firstName: yup.string().required('First name is required').max(50),
    lastName: yup.string().required('Last name is required').max(50),
  }),

  'team-admin': yup.object({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number'),
    teamName: yup.string().required('Team name is required').max(100),
    phoneNumber: yup.string()
      .required('Phone number is required')
      .matches(phoneRegExp, 'Phone number is not valid'),
  }),

  'league-admin': yup.object({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number'),
    leagueName: yup.string().required('League name is required').max(100),
    organization: yup.string().required('Organization is required').max(100),
    phoneNumber: yup.string()
      .required('Phone number is required')
      .matches(phoneRegExp, 'Phone number is not valid'),
  }),
};

// Add data validation schemas for different types
const validationSchemas = {
  player: yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    number: yup.number().required('Player number is required').positive().integer(),
    position: yup.string().required('Position is required'),
    battingOrder: yup.number().min(1).max(9).nullable(),
    status: yup.string().oneOf(['active', 'inactive', 'injured']),
  }),
  
  team: yup.object({
    name: yup.string().required('Team name is required'),
    division: yup.string().required('Division is required'),
    season: yup.string().required('Season is required'),
  }),

  game: yup.object({
    date: yup.date().required('Game date is required'),
    opponent: yup.string().required('Opponent is required'),
    location: yup.string().required('Location is required'),
    time: yup.string().required('Game time is required'),
  }),
};

export const validateData = async (type, data) => {
  try {
    const schema = validationSchemas[type];
    if (!schema) {
      throw new Error(`No validation schema found for type: ${type}`);
    }

    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    if (error.inner) {
      error.inner.forEach((err) => {
        errors[err.path] = err.message;
      });
    }
    return { isValid: false, errors };
  }
};
