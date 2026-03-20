const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate a JWT token for authenticated users.
 * Token contains user ID and expires in 30 days.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

/**
 * Register a new user (patient or caregiver).
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, linkedPatients } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user — password is hashed automatically by the pre-save hook
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      phone: phone || '',
      linkedPatients: linkedPatients || [],
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      linkedPatients: user.linkedPatients,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

/**
 * Login an existing user.
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and include password for comparison
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      linkedPatients: user.linkedPatients,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

/**
 * Get current user profile.
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('linkedPatients', 'name email phone');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get profile', error: error.message });
  }
};

/**
 * Get all patients (for caregivers to link).
 * GET /api/auth/patients
 */
const getPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get patients', error: error.message });
  }
};

/**
 * Link a patient to a caregiver.
 * PUT /api/auth/link-patient/:patientId
 */
const linkPatient = async (req, res) => {
  try {
    const caregiver = await User.findById(req.user._id);
    const patientId = req.params.patientId;

    if (!caregiver.linkedPatients.includes(patientId)) {
      caregiver.linkedPatients.push(patientId);
      await caregiver.save();
    }

    res.json({ message: 'Patient linked successfully', linkedPatients: caregiver.linkedPatients });
  } catch (error) {
    res.status(500).json({ message: 'Failed to link patient', error: error.message });
  }
};

module.exports = { register, login, getMe, getPatients, linkPatient };
