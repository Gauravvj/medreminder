const cron = require('node-cron');
const Medicine = require('../models/Medicine');
const MedicationLog = require('../models/MedicationLog');
const Alert = require('../models/Alert');
const User = require('../models/User');

/**
 * REMINDER SERVICE
 *
 * Runs every minute and checks all active medicines.
 * For each medicine whose scheduled time matches the current time (±2 min),
 * it checks if the patient has already logged a dose.
 * If not, it creates a "missed_dose" alert for linked caregivers.
 *
 * NOTE: In a production system, you'd use a proper job queue (Bull, Agenda)
 * and push notifications / WebSockets. This cron approach is suitable for demos.
 */

const startReminderService = () => {
  console.log('⏰ Reminder service started — checking every minute');

  // Run every minute: "* * * * *"
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const currentHour = String(now.getHours()).padStart(2, '0');
      const currentMinute = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;

      // Find all active medicines that have a schedule matching current time
      const medicines = await Medicine.find({
        active: true,
        scheduleTimes: currentTime,
      });

      for (const medicine of medicines) {
        // Check if patient already took this medicine in the last 2 hours
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        const existingLog = await MedicationLog.findOne({
          patientId: medicine.patientId,
          medicineId: medicine._id,
          status: 'taken',
          takenTime: { $gte: twoHoursAgo },
        });

        if (!existingLog) {
          // Patient hasn't taken this medicine — create a missed log
          await MedicationLog.create({
            patientId: medicine.patientId,
            medicineId: medicine._id,
            scheduledTime: currentTime,
            status: 'missed',
            confirmationMethod: 'manual',
          });

          // Alert linked caregivers
          const caregivers = await User.find({
            role: 'caregiver',
            linkedPatients: medicine.patientId,
          });

          for (const cg of caregivers) {
            await Alert.create({
              patientId: medicine.patientId,
              caregiverId: cg._id,
              type: 'missed_dose',
              message: `${medicine.medicineName} (${medicine.dosage}) was not taken at ${currentTime}`,
            });
          }

          console.log(`⚠️  Missed dose alert: ${medicine.medicineName} for patient ${medicine.patientId}`);
        }
      }
    } catch (error) {
      console.error('Reminder service error:', error.message);
    }
  });
};

module.exports = { startReminderService };
