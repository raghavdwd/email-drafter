import './src/config/env.js';
import http from "http";
import app from "./src/app/app.js";


const PORT = process.env.PORT || 3000;

//using cors for cross origin resource sharing
import cors from "cors";    

import session from 'express-session';
import passport from 'passport';
import './src/config/passport.js';


import sequelize from './src/config/sequelize.js';
import './src/models/user.js';
import './src/models/emailTemplate.js';
import './src/models/uploadedRow.js';

const server = http.createServer(app);

// Sync database and start server
sequelize.sync({ alter: true }) // Set alter: true if you want to update tables, but be careful in production
  .then(() => {
    console.log('✓ Database synced successfully');
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('✗ Database sync failed:', err);
  });








