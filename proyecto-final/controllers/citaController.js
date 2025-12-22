const Cita = require('../models/Cita');
const Notificacion = require('../models/Notificacion');
const HistorialCita = require('../models/HistorialCita');
const { obtenerNumero } = require('../services/configService');
const mongoose = require ('mongoose');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.crearCita = async (req, res) => {
    try {
    const {
      FechaInicio,
      FechaFin,
      Sede,
      TipoEvento,
      EsClienteExistente,
      UsuarioResponsable,
      ClienteId,
      PacienteId,
      VeterinarioId,
      Especialista,
      NombrePropietario,
      Contacto1,
      Contacto2,
      NombrePaciente,
      Especie,
      Raza,
      Sexo,
      Caracter,
      PatologiasPrevias,
      Observaciones,
      VentaId
    } = req.body;
    if (!FechaInicio) {
      return res.status(400).json({ msg: 'FechaInicio es obligatoria' });
    }
    if (!UsuarioResponsable) {
      return res.status(400).json({ msg: 'UsuarioResponsable es obligatorio' });
    }
    const inicio = new Date(FechaInicio);
    let fin = FechaFin ? new Date(FechaFin) : null;


    if (!fin) {
      const duracionMin = await obtenerNumero(
        'CITAS.DURACION_DEFAULT_MINUTOS',
        Sede || null, 30 );
      fin = new Date(inicio.getTime() + duracionMin * 60 * 1000);
    }
      const nuevaCita = new Cita({ 
      EsClienteExistente,
      UsuarioResponsable,
      ClienteId: ClienteId || null,
      PacienteId: PacienteId || null,
      VeterinarioId: VeterinarioId || null,
      Especialista,
      NombrePropietario,
      Contacto1,
      Contacto2,
      NombrePaciente,
      Especie,
      Raza,
      Sexo,
      Caracter,
      PatologiasPrevias,
      Estado: 'Programado',
      TipoEvento,
      Sede,
      FechaInicio: inicio,
      FechaFin: fin,
      Observaciones,
      VentaId: VentaId || null
    });
      await nuevaCita.save();

    const usuarioId = req.user?.id || UsuarioResponsable;

      try {
        await Notificacion.create({
          UsuarioId: null,
          Titulo: 'Nueva cita programada',
          Mensaje: `Cita para ${nuevaCita.NombrePaciente} con especialista ${nuevaCita.Especialista} el ${nuevaCita.FechaInicio.toLocaleString()}`,
          Tipo: 'Cita',
          Nivel: 'info',
          ReferenciaId: nuevaCita._id,
          ModeloRelacionado: 'Cita',
        }); 
          

      } catch (e) {
        console.error('No se pudo crear notificación de cita:', e.message);
      }

      try {
        await HistorialCita.create({
        CitaId: nuevaCita._id,
        EstadoAnterior: null,
        EstadoNuevo: nuevaCita.Estado,
        Motivo: 'Creación de cita',
        UsuarioResponsable: usuarioId
      });

    } catch (e) {
     console.error('No se pudo crear historial inicial de cita:', e.message);
          
    }

       res.status(201).json(nuevaCita);

    try {
      const usuarioLogId = req.user?.id || req.user?._id || UsuarioResponsable || null;

      await Log.create({
        UsuarioId: usuarioLogId,
        Accion: 'CREAR_CITA',
        Detalle: `Cita creada para paciente ${
          nuevaCita.NombrePaciente || nuevaCita.PacienteId
        } en fecha ${nuevaCita.FechaInicio?.toLocaleString()}`,
        IP: req.ip,
        UserAgent: req.headers['user-agent']
      });
    } catch (errLog) {
      console.error('Error registrando log de crear cita:', errLog.message);
    }


  } catch (error) {
    console.error("❌ Error al guardar cita:", error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.obtenerCitas = async (req, res) => {
    try {
        const { usuario, especialista, estado, desde, hasta} = req.query;
        const filtro = usuario ? { UsuarioResponsable: usuario } : {};
        if (especialista) filtro.Especialista = especialista;
        if (estado) filtro.Estado = estado;
        if (desde || hasta) {
        filtro.FechaInicio = {};
        if (desde) filtro.FechaInicio.$gte = new Date(desde);
        if (hasta) filtro.FechaInicio.$lte = new Date(hasta + 'T23:59:59');
    }
      const citas = await Cita.find(filtro).sort({ FechaInicio: 1 });
        res.json(citas);
    } catch (error) {
        console.error('Error al obtener citas:', error);
        res.status(500).json({ error: 'Error al obtener citas' });
    }
};

exports.obtenerCitaPorId = async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const cita = await Cita.findById(id)

      if (!cita) return res.status(404).json({ mensaje: "Cita no encontrada" });
      
    res.json(cita);
  } catch (error){
    console.error(error);
    res.status(500).json({error: 'Error al obtener la cita'});
  }
};

exports.eliminarCita = async (req, res) => {
    try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const cita = await Cita.findByIdAndDelete(id);
    if (!cita) {
      return res.status(404).json({ mensaje: 'Cita no encontrada' });
    }

    await HistorialCita.deleteMany({ CitaId: id });
    res.json({ mensaje: 'Cita eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo eliminar la cita' });
  }
};

exports.actualizarCita = async (req, res)=> {
 try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
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
        "Sede",
        "FechaInicio",
        "FechaFin",
        "Observaciones",
        "ClienteId",
        "PacienteId",
        "VeterinarioId",
        "ServicioPrincipalId",
        "ServicioAdicionales"
        ];

       const updateData = {};
        for (const campo of camposPermitidos) {
            if (req.body[campo] !== undefined) updateData[campo] = req.body[campo];}

          
        const citaOriginal = await Cita.findById(id);
    if (!citaOriginal) {
      return res.status(404).json({ mensaje: "Cita no encontrada" });
    }

    const citaActualizada = await Cita.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({ mensaje: "Cita actualizada correctamente", cita: citaActualizada });

    try {
      let detalle = `Cita ${citaActualizada._id} editada.`;
      if (citaOriginal.Estado !== citaActualizada.Estado) {
        detalle += ` Estado: ${citaOriginal.Estado} → ${citaActualizada.Estado}`;
      }

      await Log.create({
        UsuarioId: req.user?.id || req.user?._id,
        Accion: 'EDITAR_CITA',
        Detalle: detalle,
        IP: req.ip,
        UserAgent: req.headers['user-agent']
      });
    } catch (errLog) {
      console.error('Error registrando log de editar cita:', errLog.message);
    }
    } catch (error) {
        console.error("❌ Error al actualizar cita:", error);
        res.status(500).json({ error: "Error al actualizar cita", detalles: error.message });
    }

};

exports.actualizarEstadoCita = async (req, res) => {

    try {
        const { id } = req.params;
        const { nuevoEstado, motivo, nuevaFecha, usuario } = req.body;
      
        if (!isValidId(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    if (!nuevoEstado) {
      return res.status(400).json({ error: 'nuevoEstado es obligatorio' });
    }

    const usuarioId = req.user?.id || usuario || null;

    const citaOriginal = await Cita.findById(id);
    if (!citaOriginal) {
      return res.status(404).json({ mensaje: 'Cita no encontrada' });
    }
        const update = {
            Estado: nuevoEstado,
            Motivo: motivo,
            UsuarioResponsable: usuario
        };

        if (nuevoEstado === "Reprogramado" && nuevaFecha) {
            const inicio = new Date(nuevaFecha);

            update.FechaInicio = inicio;
            const duracion = citaOriginal.FechaFin - citaOriginal.FechaInicio;
            update.FechaFin = new Date(inicio.getTime() + duracion);
        }

        const citaActualizada = await Cita.findOneAndUpdate(
            { _id: id },
            { $set: update },
            { new: true, runValidators: true }
        );

        if (!citaActualizada) {
          return res.status(404).json({ mensaje: "Cita no encontrada" });
        }

        try {
      await HistorialCita.create({
        CitaId: citaActualizada._id,
        EstadoAnterior: citaOriginal.Estado,
        EstadoNuevo: nuevoEstado,
        Motivo: motivo || '',
        UsuarioResponsable: usuarioId 
      });
    } catch (e) {
      console.error('No se pudo crear historial externo de cita:', e.message);
    }

        try {
          let titulo = 'Actualización de cita';
          let nivel = 'info';

          if (nuevoEstado === 'Reprogramado') {
            titulo = 'Cita reprogramada';
            nivel = 'warning';
          } else if (nuevoEstado === 'Cancelado') {
            titulo = 'Cita cancelada';
            nivel = 'error';
          } else if (nuevoEstado === 'Finalizado') {
            titulo = 'Cita finalizada';
            nivel = 'success';
          }

        await Notificacion.create({
          UsuarioId: null, 
          Titulo: titulo,
          Mensaje: `Cita de ${citaActualizada.NombrePaciente} (${citaActualizada.Especialista}) ahora está en estado: ${nuevoEstado}. Motivo: ${motivo || 'N/A'}`,
          Tipo: 'Cita',
          Nivel: nivel,
          ReferenciaId: citaActualizada._id,
          ModeloRelacionado: 'Cita'
        });

      } catch (e) {
        console.error('No se pudo crear notificación de cambio de estado de cita:', e.message);
      }


      res.json({mensaje: 'Cita actualizada correctamente', cita});
    } catch (error){
        res.status(500).json({ error: 'Error al actualizar cita', detalles: error.mensaje});
    }
};

exports.obtenerHistorialGeneral = async (req, res) => {
    try {
        const citas = await Cita.find({}, { HistorialCambios: 1 }) .lean();
        const historial = citas.flatMap(c => c.HistorialCambios||[].map(h => ({...h, CitaId: c._id})));
        res.json(historial);
    } catch (error) {
    console.error(error);
        res.status(502).json({ error: 'Error al obtener historial de citas' });
    }
};

exports.historialpaciente = async (req, res)=>{
    try {
    const { pacienteId } = req.params;

    if (!isValidId(pacienteId)) {
      return res.status(400).json({ error: 'PacienteId inválido' });
    }
        const citas = await Cita.find({
            PacienteId: pacienteId
        }).sort({ FechaInicio: -1 });

        res.json(citas);
    } catch (error) {
      console.error('Error historial paciente:', error);
        res.status(500).json({ error: 'Error al obtener historial clínico' });
    }
}

exports.obtenerCitasPorMes = async (req, res) => {
  try {
    const { anio } = req.query;

    const matchStage = {};

    if (anio) {
      const y = Number(anio);
      matchStage.FechaInicio = {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31, 23, 59, 59 )
      };
    }

    const resultado = [];

    resultado.push({ $match: matchStage}),
    resultado.push(
      {
        $group: {
          _id: { $month: "$FechaInicio" },
          cantidad: { $sum: 1 }
        }
      },
      {
        $project: {
          mes: "$_id",
          cantidad: 1,
          _id: 0
        }
      },
      {$sort: {mes: 1 }}
    );
    
    const resultados = await Cita.aggregate(resultado);
    res.json(resultados);

  } catch (error) {
    console.error("Error al obtener citas por mes:", error);
    res.status(500).json({ error: "Error interno al obtener citas por mes" });
  }
};

exports.obtenerCitasPorRangoFechas = async (req, res) => {
  try {
    const { inicio, fin, usuario, especialista } = req.query;

    if (!inicio || !fin) {
      return res.status(400).json({ error: 'Se requieren los parámetros "inicio" y "fin"' });
    }

    const filtro = {
      FechaInicio: { $gte: new Date(inicio), $lte: new Date(new Date(fin).setHours(23, 59, 59)) }
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

exports.verificarConflictoCita = async (req, res) => {
      try {
        const { especialista, inicio, fin, idCita, tipoEvento, sede } = req.query;

        if (!especialista || !inicio || !fin)
            return res.status(400).json({ error: 'Faltan parámetros requeridos' });

        const filtro = {
          Especialista: especialista,
          FechaInicio: { $lt: new Date(fin) }, 
          FechaFin: { $gt: new Date(inicio) },
          Estado: { $in: ['Programado', 'Reprogramado']}
        };

        if (tipoEvento) filtro.TipoEvento = tipoEvento;
        if (sede) filtro.Sede = sede;

        if (idCita && mongoose.Types.ObjectId.isValid(idCita)) {
            filtro._id = { $ne: idCita };
        }

        const conflictos = (await Cita.find(filtro)).sort({FechaInicio: 1});

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

