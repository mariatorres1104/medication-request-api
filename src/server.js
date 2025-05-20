// backend/index.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error de conexión a MongoDB:"));
db.once("open", () => console.log("✅ Conectado a MongoDB"));

const medicationRequestSchema = new mongoose.Schema({
  status: String,
  intent: String,
  medicationCodeableConcept: Object,
  subject: Object,
  authoredOn: Date,
  requester: Object,
  dosageInstruction: Array,
  delivered: Boolean, // para farmacéutico
  deliveryDate: Date  // para farmacéutico
});

const MedicationRequest = mongoose.model("MedicationRequest", medicationRequestSchema);

// Ruta principal
app.get("/", (req, res) => {
  res.send("API de MedicationRequest funcionando 🚀");
});

// Obtener todas las prescripciones
app.get("/api/medicationrequest", async (req, res) => {
  try {
    const data = await MedicationRequest.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los datos" });
  }
});

// Obtener una prescripción por ID
app.get("/api/medicationrequest/:id", async (req, res) => {
  try {
    const med = await MedicationRequest.findById(req.params.id);
    if (!med) return res.status(404).json({ error: "No encontrado" });
    res.json(med);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar la prescripción" });
  }
});

// Crear una nueva prescripción
app.post("/api/medicationrequest", async (req, res) => {
  try {
    const nuevaMed = new MedicationRequest({
      ...req.body,
      delivered: false
    });
    await nuevaMed.save();
    res.status(201).json({ mensaje: "Prescripción guardada", data: nuevaMed });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al guardar la prescripción", error });
  }
});

// Marcar una prescripción como entregada (rol farmacéutico)
app.put("/api/medicationrequest/:id/deliver", async (req, res) => {
  try {
    const med = await MedicationRequest.findById(req.params.id);
    if (!med) return res.status(404).json({ error: "Prescripción no encontrada" });

    med.delivered = true;
    med.deliveryDate = new Date();
    await med.save();
    res.json({ mensaje: "Medicamento entregado", data: med });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la entrega" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

