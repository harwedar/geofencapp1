
// seed.js
const mongoose = require('mongoose');
mongoose.connect(
  'mongodb+srv://user2:12345678user2@cluster0.aahlm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

//mongodb+srv://<db_username>:<db_password>@cluster0.aahlm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

const AdminUser = mongoose.model('AdminUser', new mongoose.Schema({
  username: String,
  password: String
}));

AdminUser.create({ username: 'admin', password: 'password' })
  .then(() => {
    console.log('✅ Admin user created (admin/password)');
    mongoose.disconnect();
  });
