# Aplicación Web Pontem 💻

## Front End 🌎

### Para correr

1. Instalar las dependecncias
```
npm install --legacy-peer-deps
```
2. Iniciar la aplicación
```
npm start
```

### .env

#### Ejemplo:
```
REACT_APP_API_URL=http://localhost:8000
```

### Limpiar el caché
```
npm run clean-cache
```

## Back End 🌐

### Para correr

1. Instalar las dependecncias
```
npm install
```
2. Levantar el servidor
```
node src/index.js
```

### .env

#### Ejemplo:
```
DATABASE_URL="postgresql://username:password@host:port/database"
JWT_SECRET="mysecretjwt"
PORT=8000   # Opcional. Por defecto 8000
```
