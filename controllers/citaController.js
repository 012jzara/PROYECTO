const Cita = require('../models/Cita');

// Crear una nueva cita
const crearCita = async (req, res) => {
    try {
        const nuevaCita = new Cita(req.body);
        await nuevaCita.save();
        res.status(201).json(nuevaCita);
    } catch (error) {
        res.status(400).json({ error: 'Error al guardar cita' });
    }
};

// Obtener todas las citas
const obtenerCitas = async (req, res) => {
    try {
        const citas = await Cita.find();
        res.json(citas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener citas' });
    }
};

// Eliminar una cita por ID
const eliminarCita = async (req, res) => {
    try {
        await Cita.findByIdAndDelete(req.params.id);
        res.json({ mensaje: 'Cita eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'No se pudo eliminar la cita' });
    }
};

// Actualizar una cita por ID
const actualizarCita = async (req, res)=> {
 try {
        const citaExistente = await Cita.findById(req.params.id);
        if (!citaExistente) {
            return res.status(404).json({ mensaje: 'Cita no encontrada' });
        }

        const nuevaData = req.body;

        // Agregar registro al historial si hay cambio de estado
        if (nuevaData.Estado && nuevaData.Estado !== citaExistente.Estado) {
            const nuevoHistorial = {
                Fecha: new Date(),
                EstadoAnterior: citaExistente.Estado,
                EstadoNuevo: nuevaData.Estado,
                Motivo: nuevaData.Observaciones || 'Actualización manual',
                UsuarioResponsable: 'Admin' // Puedes reemplazar esto con info de autenticación
            };

            citaExistente.HistorialCambios.push(nuevoHistorial);
        }

        // Actualiza campos
        Object.assign(citaExistente, nuevaData);
        await citaExistente.save();

        res.json({ mensaje: 'Cita actualizada', cita: citaExistente });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar cita', error });
    }
};
const estadoCita = async(req, res)=>{
    try {
        const cita = await Cita.findById(req.params.id);
        if (!cita) return res.status(404).json({ mensaje: 'Cita no encontrada' });

        const { nuevoEstado, motivo, fechaNueva, usuario } = req.body;

        cita.HistorialCambios = cita.HistorialCambios || [];
        cita.HistorialCambios.push({
            Fecha: new Date(),
            EstadoAnterior: cita.Estado,
            EstadoNuevo: nuevoEstado,
            Motivo: motivo || '',
            UsuarioResponsable: usuario || 'admin'
        });

        cita.Estado = nuevoEstado;
        if (nuevoEstado === 'Pospuesto' && fechaNueva) {
            cita.FechaInicio = new Date(fechaNueva);
            cita.FechaFin = new Date(fechaNueva); // +1h si deseas
        }

        await cita.save();
        res.json({ mensaje: 'Cita actualizada con historial', cita });
    } catch (error) {
        res.status(501).json({ mensaje: 'Error al actualizar cita', error });
    } 
};

// Obtener historial global
const obtenerHistorialGeneral = async (req, res) => {
    try {
        const citas = await Cita.find({}, { historialCambios: 1, _id: 0 });
        const historial = citas.flatMap(c => c.historialCambios);
        res.json(historial);
    } catch (error) {
        res.status(502).json({ error: 'Error al obtener historial de citas' });
    }
};
//obtener historial-paciente 
const historialpacienteCita = async (req, res)=>{
      const nombre = req.params.nombre;
    try {
        const citas = await Cita.find({
            NombrePaciente: { $regex: nombre, $options: 'i' }
        }).sort({ FechaInicio: -1 });

        res.json(citas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener historial clínico' });
    }
}

//Actualizar estado de cita + agregar historial
const actualizarEstadoCita = async (req, res) => {
    const {id} = req.params;
    const {nuevoEstado, motivo, nuevaFecha, usuario} = req.body;

    try {
        const cita = await Cita.findById(id);
        if (!cita) return res.status(404).json({mensaje: 'Cita no encontrada'});

        const historial = {
            EstadoAnterior: cita.Estado,
            EstadoNuevo: nuevoEstado,
            Motivo: motivo || 'cambio de estado',
            UsuarioResponsable: usuario || 'Desconocido'
        };

        cita.Estado = nuevoEstado;
       if (nuevoEstado === 'Pospuesto' && nuevaFecha)
        {
            cita.FechaInicio = new Date(nuevaFecha);
            cita.FechaFin = new Date(nuevaFecha);
        }

        cita.historialCambios.push(historial);
        await cita.save();

        res.json({mensaje: 'Cita actualizada correctamente', cita});
    } catch (error){
        res.status(500).json({ error: 'Error al actualizar cita', detalles: error.mensaje});
    }
};

const obtenerCitasPorMes = async (req, res) => {
  try {
    const resultado = await Cita.aggregate([
      {
        $group: {
          _id: { $month: "$fecha" },
          cantidad: { $sum: 1 }
        }
      },
      {
        $project: {
          mes: {
            $arrayElemAt: [
              [
                "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
              ],
              "$_id"
            ]
          },
          cantidad: 1,
          _id: 0
        }
      },
      { $sort: { mes: 1 } }
    ]);

    res.json(resultado);
  } catch (error) {
    console.error("Error al obtener citas por mes:", error);
    res.status(500).json({ error: "Error interno al obtener citas por mes" });
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
  obtenerCitasPorMes
};
