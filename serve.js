const express = require('express');
const path = require('path');
const app = express();
const PORT = 5000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let data = { x: 0, y: 0, z: 0 }; // Inicialmente, no hay datos del giroscopio

// Ruta GET para recibir los datos del giroscopio
app.get('/datos_giroscopio', (req, res) => {
  const { x, y, z } = req.query;
  data = { x: parseFloat(x), y: parseFloat(y), z: parseFloat(z) }; // Actualizar los datos del giroscopio
  res.send('Datos recibidos correctamente.');
});

// Ruta GET para obtener los datos actuales
app.get('/obtener_datos', (req, res) => {
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Servidor Node.js funcionando en el puerto ${PORT}`);
});