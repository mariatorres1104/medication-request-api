require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Configuración de Express
const app = express();
app.use(express.json());
app.use(cors());

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error de conexión a MongoDB:"));
db.once("open", () => console.log("Conectado a MongoDB"));

// Definir el esquema y modelo para MedicationRequest
const medicationRequestSchema = new mongoose.Schema({
  status: String,
  intent: String,
  medicationCodeableConcept: Object,
  subject: Object,
  authoredOn: Date,
  requester: Object,
  dosageInstruction: Array
});

const MedicationRequest = mongoose.model("MedicationRequest", medicationRequestSchema);

// Ruta principal
app.get("/", (req, res) => {
  res.send("API de MedicationRequest funcionando 🚀");
});

// Ruta para obtener todas las prescripciones
app.get("/api/medicationrequest", async (req, res) => {
  try {
    const data = await MedicationRequest.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los datos" });
  }
});

// Ruta para obtener una prescripción por ID
app.get("/medicationrequests/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const prescription = await MedicationRequest.findById(id);
    if (!prescription) {
      return res.status(404).json({ mensaje: "Prescripción no encontrada" });
    }
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al buscar la prescripción", error });
  }
});

// Ruta para guardar una nueva prescripción
app.post("/api/medicationrequest", async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body);
    const nuevaMed = new MedicationRequest(req.body);
    await nuevaMed.save();
    res.status(201).json({ mensaje: "Prescripción guardada", data: nuevaMed });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al guardar la prescripción", error });
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
