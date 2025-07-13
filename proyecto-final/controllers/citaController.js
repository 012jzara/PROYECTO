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

// Obtener todas las citas (o filtradas por usuario)

const obtenerCitas = async (req, res) => {
    try {
        const { usuario } = req.query;
        const filtro = usuario ? { RegistradoPor: usuario } : {};

        const citas = await Cita.find(filtro).sort({ FechaInicio: 1 });
        res.json(citas);
    } catch (error) {
        console.error('Error al obtener citas:', error);
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

// obtener citas por mes 

const obtenerCitasPorMes = async (req, res) => {
  try {
    const { año } = req.query;

    const matchStage = {};

    // Si el año fue proporcionado, filtrar por ese año
    if (año) {
      const anio = parseInt(año);
      const inicio = new Date(anio, 0, 1);  // 1 de enero, 00:00
      const fin = new Date(anio, 11, 31, 23, 59, 59, 999); // 31 de diciembre, 23:59:59.999

      matchStage.FechaInicio = { $gte: inicio, $lte: fin };
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
      { $sort: { mesNumero: 1 } }
    ]);

    res.json(resultado);
  } catch (error) {
    console.error("Error al obtener citas por mes:", error);
    res.status(500).json({ error: "Error interno al obtener citas por mes" });
  }
};

// obtener citas oir nes flexible

const obtenerCitasPorMesFlexible = async (req, res) => {
  try {
    const { año, agrupacion } = req.query;
    const matchStage = {};

    // Filtrar por año si se proporciona
    if (año) {
      const anio = parseInt(año);
      const inicio = new Date(anio, 0, 1);
      const fin = new Date(anio, 11, 31, 23, 59, 59, 999);
      matchStage.FechaInicio = { $gte: inicio, $lte: fin };
    }

    // Construir agrupación dinámica
    let groupId = {
      mes: { $month: "$FechaInicio" }
    };

    if (agrupacion === "especialista") {
      groupId.especialista = "$Especialista";
    } else if (agrupacion === "tipoEvento") {
      groupId.tipoEvento = "$TipoEvento";
    }

    const resultado = await Cita.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupId,
          cantidad: { $sum: 1 }
        }
      },
      {
        $project: {
          mesNumero: "$_id.mes",
          mes: {
            $arrayElemAt: [
              [
                "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
              ],
              "$_id.mes"
            ]
          },
          especialista: "$_id.especialista",
          tipoEvento: "$_id.tipoEvento",
          cantidad: 1,
          _id: 0
        }
      },
      { $sort: { mesNumero: 1, especialista: 1, tipoEvento: 1 } }
    ]);

    res.json(resultado);
  } catch (error) {
    console.error("Error al obtener citas agrupadas:", error);
    res.status(500).json({ error: "Error interno al generar el reporte" });
  }
};

// obptener citas por rango de fechas

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
      filtro.RegistradoPor = usuario;
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
  const { especialista, inicio, fin, tipoEvento, sede, idCita} = req.query;

  if (!especialista || !inicio || !fin) {
    return res.status(400).json({ error: 'Parámetros requeridos: especialista, inicio, fin' });
  }

  try {
    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);

    // Filtro base obligatorio
    const filtro = {
      Especialista: especialista,
      $or: [
        { FechaInicio: { $lt: fechaFin }, FechaFin: { $gt: fechaInicio } }
      ]
    };

    // Filtros adicionales opcionales
    if (tipoEvento) {
      filtro.TipoEvento = tipoEvento;
    }

    if (sede) {
      filtro.Sede = sede;
    }
    // Excluir una cita específica si se pasa el ID (edición de cita)
    if (idCita) {
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
  obtenerCitasPorMesFlexible,
  obtenerCitasPorRangoFechas,
  verificarConflictoCita
};
