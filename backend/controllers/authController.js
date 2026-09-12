import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ErrorResponse from '../utils/errorResponse.js';

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role, // <-- ADDED
    },
  });
};

export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return next(new ErrorResponse('User already exists', 400));

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ firstName, lastName, username, email, password: hashedPassword });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return next(new ErrorResponse('Please provide username and password', 400));

    const user = await User.findOne({ $or: [{ username }, { email: username }] }).select('+password');
    if (!user) return next(new ErrorResponse('Invalid credentials', 401));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new ErrorResponse('Invalid credentials', 401));

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};