
// seed.js
const mongoose = require('mongoose');
mongoose.connect('mongoose.connect('mongodb+srv://awedaolusina:synteqdeveloper@cluster0.prmgr.mongodb.net/geofence?retryWrites=true&w=majority&appName=Cluster0');
', {
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
