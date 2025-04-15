const db = require('../config/database');

class SerialNumberGenerator {
  static async generate() {
    const currentYear = new Date().getFullYear();
    
    // Get the latest serial number for the current year
    const result = await db('defects')
      .where('serial_number', 'like', `BUG-${currentYear}-%`)
      .orderBy('serial_number', 'desc')
      .first();

    let sequence = 1;
    if (result) {
      // Extract the sequence number from the last serial number
      const lastSequence = parseInt(result.serial_number.split('-')[2]);
      sequence = lastSequence + 1;
    }

    // Format the sequence number to always have 4 digits (e.g., 0001, 0012, 0123)
    const formattedSequence = sequence.toString().padStart(4, '0');
    
    return `BUG-${currentYear}-${formattedSequence}`;
  }
}

module.exports = SerialNumberGenerator;
