const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { mqttClient, subscribeTopic } = require('./utils/mqttClient');

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: 'http://localhost:3003',
    credentials: true,
  })
);
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(cookieParser());

// SOCKET
const socketIo = require('socket.io');
const io = socketIo(server);
module.exports = io;

// Routes
const useRoutes = require('./routes/index');
useRoutes(app);

app.use((error, req, res, next) => {
  console.log(error);
  return res.sendStatus(500);
});

// MQTT
mqttClient.on('connect', () => {
  if (mqttClient.connected === true) {
    // subscribe to a topic
    subscribeTopic('esp8266/sensor');
    subscribeTopic('esp8266/device/status');
  }
});

// Sync the models with database
const PORT = process.env.PORT || 4005;
const sequelize = require('./configs/database');
const SensorModel = require('./models/Sensor.model');
const DataSensor = require('./models/DataSensor.model');
const DeviceModel = require('./models/Device.model');
const DataActionModel = require('./models/DataAction.model');
const UserModel = require('./models/User.model');
const TokenModel = require('./models/Token.model');

// Define the relationships
SensorModel.hasMany(DataSensor);
DataSensor.belongsTo(SensorModel);
DeviceModel.hasMany(DataActionModel);
DataActionModel.belongsTo(DeviceModel);
UserModel.hasMany(DataActionModel);
DataActionModel.belongsTo(UserModel);
UserModel.hasMany(TokenModel);
TokenModel.belongsTo(UserModel);

sequelize
  .sync({ force: false })
  .then(() => {
    console.log('Database synchronized.');
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error synchronizing database:', err);
  });
