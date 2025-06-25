
// seed.js
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/geofencing', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const AdminUser = mongoose.model('AdminUser', new mongoose.Schema({
  username: String,
  password: String
}));

AdminUser.create({ username: 'admin', password: 'password' })
  .then(() => {
    console.log('✅ Admin user created (admin/password)');
    mongoose.disconnect();
  });
