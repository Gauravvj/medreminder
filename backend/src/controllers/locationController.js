const Location = require('../models/Location');
const User = require('../models/User');

/**
 * Update the current patient's live location.
 * PUT /api/location/update
 * Body: { latitude, longitude }
 */
const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Upsert — create or update the single location doc for this patient
    const location = await Location.findOneAndUpdate(
      { patientId: req.user._id },
      {
        patientId: req.user._id,
        latitude,
        longitude,
        updatedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: 'Location updated', location });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update location', error: error.message });
  }
};

/**
 * Get live locations for all patients linked to the current caregiver.
 * GET /api/location/patients
 */
const getPatientLocations = async (req, res) => {
  try {
    // Get the caregiver's linked patients
    const caregiver = await User.findById(req.user._id)
      .select('linkedPatients')
      .populate('linkedPatients', 'name email');

    if (!caregiver || !caregiver.linkedPatients?.length) {
      return res.json([]);
    }

    const patientIds = caregiver.linkedPatients.map(p => p._id);

    // Fetch most recent location for each linked patient
    const locations = await Location.find({ patientId: { $in: patientIds } });

    // Merge patient info with location data
    const result = caregiver.linkedPatients.map(patient => {
      const loc = locations.find(l => l.patientId.toString() === patient._id.toString());
      return {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        latitude: loc?.latitude || null,
        longitude: loc?.longitude || null,
        updatedAt: loc?.updatedAt || null,
        hasLocation: !!loc,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get patient locations', error: error.message });
  }
};

module.exports = { updateLocation, getPatientLocations };
