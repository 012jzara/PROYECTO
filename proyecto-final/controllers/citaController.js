const Cita = require('../models/Cita');
const mongoose = require ('mongoose');

// Crear cita
const crearCita = async (req, res) => {
    try {
        const nuevaCita = new Cita(req.body);
        await nuevaCita.save();
        res.status(201).json(nuevaCita);
    } catch (error) {
        console.error("❌ Error al guardar cita:", error.message);
        res.status(400).json({ error: error.message });
    }
};

// Obtener  citas
const obtenerCitas = async (req, res) => {
    try {
        const { usuario } = req.query;
        const filtro = usuario ? { UsuarioResponsable: usuario } : {};
        const citas = await Cita.find(filtro).sort({ FechaInicio: 1 });
        res.json(citas);
    } catch (error) {
        console.error('Error al obtener citas:', error);
        res.status(500).json({ error: 'Error al obtener citas' });
    }
};

// Eliminar una cita
const eliminarCita = async (req, res) => {
    try {
        await Cita.findByIdAndDelete(req.params.id);
        res.json({ mensaje: 'Cita eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'No se pudo eliminar la cita' });
    }
};

// Actualizar una cita + historial 
const actualizarCita = async (req, res)=> {
 try {
         const camposPermitidos = [
            "EsClienteExistente",
            "UsuarioResponsable",
            "NombrePropietario",
            "Contacto1",
            "Contacto2",
            "NombrePaciente",
            "Especie",
            "Raza",
            "Sexo",
            "Caracter",
            "PatologiasPrevias",
            "Estado",
            "Especialista",
            "TipoEvento",
            "FechaInicio",
            "FechaFin",
            "Observaciones",
            "ClienteId"
        ];

       const updateData = {};
        for (const campo of camposPermitidos) {
            if (req.body[campo] !== undefined) {
                updateData[campo] = req.body[campo];
            }
          }

          // Se delega totalmente al middleware el registro del historial
        const citaActualizada = await Cita.findOneAndUpdate(
            { _id: req.params.id },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!citaActualizada)
            return res.status(404).json({ mensaje: "Cita no encontrada" });

        res.json({ mensaje: "Cita actualizada correctamente", cita: citaActualizada });

    } catch (error) {
        console.error("❌ Error al actualizar cita:", error);
        res.status(500).json({ error: "Error al actualizar cita", detalles: error.message });
    }

};

// Obtener historial global

const obtenerHistorialGeneral = async (req, res) => {
    try {
        const citas = await Cita.find({}, { HistorialCambios: 1, _id: 0 }) .lean();
        const historial = citas.flatMap(c => c.HistorialCambios || []);
        res.json(historial);
    } catch (error) {
        res.status(502).json({ error: 'Error al obtener historial de citas' });
    }
};

//obtener historial-paciente 

const historialpacienteCita = async (req, res)=>{
    try {
        const citas = await Cita.find({
            NombrePaciente: { $regex: req.params.nombre, $options: 'i'}
        }).sort({ FechaInicio: -1 });

        res.json(citas);
    } catch (error) {
      console.error('Error historial paciente:', error);
        res.status(500).json({ error: 'Error al obtener historial clínico' });
    }
}

//Actualizar estado + historial

const actualizarEstadoCita = async (req, res) => {

    try {
        const { id } = req.params;
        const { nuevoEstado, motivo, nuevaFecha, usuario } = req.body;

        const update = {
            Estado: nuevoEstado,
            Motivo: motivo,
            UsuarioResponsable: usuario
        };

        if (nuevoEstado === "Reprogramado" && nuevaFecha) {
            const inicio = new Date(nuevaFecha);

            update.FechaInicio = inicio;

            // Recalcular duración correctamente
            const citaOriginal = await Cita.findById(id);
            if (!citaOriginal) return res.status(404).json({ mensaje: "Cita no encontrada" });

            const duracion = citaOriginal.FechaFin - citaOriginal.FechaInicio;
            update.FechaFin = new Date(inicio.getTime() + duracion);
        }

        const citaActualizada = await Cita.findOneAndUpdate(
            { _id: id },
            { $set: update },
            { new: true, runValidators: true }
        );

        res.json({mensaje: 'Cita actualizada correctamente', cita});
    } catch (error){
        res.status(500).json({ error: 'Error al actualizar cita', detalles: error.mensaje});
    }
};

// obtener citas por mes 

const obtenerCitasPorMes = async (req, res) => {
  try {
    const { año } = req.query;

    const matchStage = {};

    if (año) {
      const anio = Number(año);
      if (!isNaN(anio)) {
      matchStage.FechaInicio = {
        $gte: new Date(anio, 0, 1),
        $lte: new Date(anio, 11, 31, 23, 59, 59 )
      };
    }
    }

    const resultado = await Cita.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $month: "$FechaInicio" },
          cantidad: { $sum: 1 }
        }
      },
      {
        $project: {
          mesNumero: "$_id",
          cantidad: 1,
          _id: 0
        }
      },
      {$sort: {mesNumero: 1 }}
    ]);
    res.json(resultado);

  } catch (error) {
    console.error("Error al obtener citas por mes:", error);
    res.status(500).json({ error: "Error interno al obtener citas por mes" });
  }
};


// citas por rango 

const obtenerCitasPorRangoFechas = async (req, res) => {
  try {
    const { inicio, fin, usuario, especialista } = req.query;

    if (!inicio || !fin) {
      return res.status(400).json({ error: 'Se requieren los parámetros "inicio" y "fin"' });
    }

    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);
    fechaFin.setHours(23, 59, 59, 999); // incluye todo el día

    // Construir filtro dinámico
    const filtro = {
      FechaInicio: { $gte: fechaInicio, $lte: fechaFin }
    };

    if (usuario) {
      filtro.UsuarioResponsable = usuario;
    }

    if (especialista) {
      filtro.Especialista = especialista;
    }

    const citas = await Cita.find(filtro).sort({ FechaInicio: 1 });
    res.json(citas);
  } catch (error) {
    console.error('Error al filtrar citas por rango:', error);
    res.status(500).json({ error: 'Error al filtrar citas por rango de fechas' });
    }
  };

// verificacion de conflicto cita

const verificarConflictoCita = async (req, res) => {
      try {
        const { especialista, inicio, fin, tipoEvento, sede, idCita } = req.query;

        if (!especialista || !inicio || !fin)
            return res.status(400).json({ error: 'Faltan parámetros requeridos' });

        const fechaInicio = new Date(inicio);
        const fechaFin = new Date(fin);

        const filtro = {
            Especialista: especialista,
            $or: [{ FechaInicio: { $lt: fechaFin }, FechaFin: { $gt: fechaInicio } }]
        };

        if (tipoEvento) filtro.TipoEvento = tipoEvento;
        if (sede) filtro.Sede = sede;

        if (idCita && mongoose.Types.ObjectId.isValid(idCita)) {
            filtro._id = { $ne: idCita };
        }

        const conflictos = await Cita.find(filtro);

        res.json({
            conflicto: conflictos.length > 0,
            cantidad: conflictos.length,
            citas: conflictos
        });

    } catch (error) {
        console.error('Error al verificar conflictos:', error);
        res.status(500).json({ error: 'Error al verificar conflicto de horarios' });
    }
};

module.exports = {
  crearCita,
  obtenerCitas,
  eliminarCita,
  actualizarCita,
  historialpacienteCita,
  actualizarEstadoCita,
  obtenerHistorialGeneral,
  obtenerCitasPorMes,
  obtenerCitasPorRangoFechas,
  verificarConflictoCita
};
