const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://marlon93gm_db_user:JnzVn6xTz3iufwyJ@clustermayansoft.66elet5.mongodb.net/cmmi_metrics?appName=clusterMayansoft');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
