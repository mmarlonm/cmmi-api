const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('[DB] MONGO_URI no definido — rutas de BD deshabilitadas.');
      return;
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // No se mata el proceso — el servidor sigue disponible para rutas sin BD (ej. /api/sharepoint)
    console.warn(`[DB] No se pudo conectar a MongoDB: ${error.message}`);
    console.warn('[DB] El servidor continuará sin persistencia MongoDB. Agrega tu IP actual en MongoDB Atlas.');
  }
};

module.exports = connectDB;
