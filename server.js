
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const turf = require('@turf/turf');
const cors = require('cors');
const path = require('path');
const webpush = require('web-push');
const session = require('express-session');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(session({ secret: 'adminsecret', resave: false, saveUninitialized: true }));

mongoose.connect(
  'mongodb+srv://SynteQ Technologies:developerSYNQ76@cluster0.aahlm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

// Models
const Region = mongoose.model('Region', new mongoose.Schema({
  regionId: String,
  geojson: Object
}));

const Device = mongoose.model('Device', new mongoose.Schema({
  deviceId: String,
  regionId: String
}));

const PendingDevice = mongoose.model('PendingDevice', new mongoose.Schema({
  deviceId: String
}));

const AdminUser = mongoose.model('AdminUser', new mongoose.Schema({
  username: String,
  password: String
}));

const Subscription = mongoose.model('Subscription', new mongoose.Schema({
  deviceId: String,
  subscription: Object
}));

// Web Push Keys
const vapidKeys = webpush.generateVAPIDKeys();
webpush.setVapidDetails('mailto:test@example.com', vapidKeys.publicKey, vapidKeys.privateKey);

// Auth middleware
function auth(req, res, next) {
  if (req.session && req.session.user === 'admin') return next();
  return res.status(403).send('Unauthorized');
}

// Routes
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await AdminUser.findOne({ username, password });
  if (admin) {
    req.session.user = 'admin';
    res.send({ success: true });
  } else {
    res.send({ success: false });
  }
});

app.post('/api/upload-region', auth, async (req, res) => {
  const { regionId, geojson } = req.body;
  await Region.findOneAndUpdate({ regionId }, { geojson }, { upsert: true });
  res.send({ message: 'Region uploaded' });
});

app.post('/api/assign-device', auth, async (req, res) => {
  const { deviceId, regionId } = req.body;
  await Device.findOneAndUpdate({ deviceId }, { regionId }, { upsert: true });
  await PendingDevice.deleteOne({ deviceId });
  res.send({ message: 'Device assigned' });
});

app.get('/api/pending-devices', auth, async (req, res) => {
  const devices = await PendingDevice.find();
  res.send(devices);
});

app.post('/api/location-update', async (req, res) => {
  const { deviceId, lat, lng } = req.body;

  const assigned = await Device.findOne({ deviceId });
  if (!assigned) {
    const alreadyPending = await PendingDevice.findOne({ deviceId });
    if (!alreadyPending) {
      await PendingDevice.create({ deviceId });
    }
    return res.send({ registered: true, assigned: false });
  }

  const region = await Region.findOne({ regionId: assigned.regionId });
  if (!region) return res.status(404).send({ error: 'Region not found' });

  const point = turf.point([lng, lat]);
  const polygon = region.geojson.features[0];
  const inside = turf.booleanPointInPolygon(point, polygon);

  if (!inside) {
    const sub = await Subscription.findOne({ deviceId });
    if (sub) {
      webpush.sendNotification(sub.subscription, JSON.stringify({
        title: 'Geofence Alert',
        body: `Device ${deviceId} is OUTSIDE region ${assigned.regionId}`
      })).catch(console.error);
    }
  }

  res.send({ assigned: true, inside });
});

app.post('/api/subscribe', async (req, res) => {
  const { deviceId, subscription } = req.body;
  await Subscription.findOneAndUpdate({ deviceId }, { subscription }, { upsert: true });
  res.send({ message: 'Subscribed' });
});

app.get('/api/vapid-public-key', (req, res) => {
  res.send({ key: vapidKeys.publicKey });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
