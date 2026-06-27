import app from './app';
import { connectDB } from './config/db';
import './config/cloudinary';

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`ResumeIQ AI Server running on port ${PORT}`);
  });
};

start();
