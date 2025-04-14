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
      const lastSequence = parseInt(result.serial_number.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `BUG-${currentYear}-${sequence.toString().padStart(4, '0')}`;
  }
}

module.exports = SerialNumberGenerator;