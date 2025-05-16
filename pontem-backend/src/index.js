const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const adminRoutes = require('./routes/adminRoutes');
const projectsRoutes = require('./routes/projectsRoutes');
const eventsRoutes = require('./routes/eventsRoutes');
const newsRoutes = require('./routes/newsRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const upload = require('./middleware/uploadMiddleware');
const {
  uploadFile,
  uploadMiddleware,
} = require('./controllers/uploadController');

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;


const allowedOrigins = [ process.env.ALLOWED_ORIGIN, process.env.ALLOWED_ORIGIN_1  ];

app.use(
  cors({
    origin: (origin, callback) => {
      // origin === undefined cuando es petición same‑origin o via herramientas como cURL/postman
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Si llega aquí, es un origen no permitido
      console.log(`🛑 Bloqueado por CORS: request desde origen NO permitido → ${origin}`);
      return callback(new Error('Origen no permitido por CORS'), false);
    },
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
    optionsSuccessStatus: 200,
    maxAge: 86400
  })
);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/api/upload', upload.single('file'), uploadFile);

app.get('/', (req, res) => {
  res.send('Hello from Pontem API');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
