const ProductoInsumo = require('../models/ProductoInsumo');
const Notificacion = require('../models/Notificacion');
const { obtenerNumero } = require('../services/configService');

exports.obtenerLotesPorVencer = async (req, res) => {
  try {
    const { tienda } = req.query;

    const diasAlerta = await obtenerNumero('INV.DIAS_ALERTA_VENCIMIENTO', tienda, 30);

    const ahora = new Date();
    const limite = new Date();
    limite.setDate(limite.getDate() + diasAlerta);

    const productos = await ProductoInsumo.find().lean();

    const lotesPorVencer = [];

    for (const producto of productos) {
      for (const t of producto.Tiendas || []) {
        if (tienda && t.Tienda !== tienda) continue;

        for (const lote of t.Lotes || []) {
          if (!lote.FechaCaducidad) continue;
          if (lote.Stock <= 0) continue;

          const fc = new Date(lote.FechaCaducidad);

          if (fc >= ahora && fc <= limite) {
            lotesPorVencer.push({
              ProductoId: producto._id,
              NombreProducto: producto.Nombre,
              Tienda: t.Tienda,
              NumeroLote: lote.NumeroLote,
              FechaCaducidad: lote.FechaCaducidad,
              Stock: lote.Stock
            });


             try {
               await Notificacion.create({
                 UsuarioId: null,
                 Titulo: 'Lote por vencer',
                 Mensaje: `El lote ${lote.NumeroLote || '-'} del producto "${producto.Nombre}" en ${t.Tienda} vence el ${fc.toLocaleDateString()}.`,
                 Tipo: 'Inventario',
                 Nivel: 'warning',
                 ReferenciaId: producto._id,
                 ModeloRelacionado: 'ProductoInsumo',
                 Tienda: t.Tienda
               });
             } catch (e) {
               console.error('No se pudo crear notificación de vencimiento:', e.message);
             }
          }
        }
      }
    }

    res.json({
      diasAlerta,
      cantidad: lotesPorVencer.length,
      lotes: lotesPorVencer
    });

  } catch (error) {
    console.error('Error al obtener lotes por vencer:', error);
    res.status(500).json({ msg: 'Error al obtener lotes por vencer', error: error.message });
  }
};
