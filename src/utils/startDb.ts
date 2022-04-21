const mongoose = require('mongoose');
const { MONGO_URI: mongoUri } = process.env;

async function run() {
  try {
      await mongoose.connect(mongoUri);

      console.log("Connected successfully to mongodb server");
    } catch (err){
      console.log('cant connect to mongodb', err)
      await mongoose.disconnect();
    }
  }

run().catch(console.dir);