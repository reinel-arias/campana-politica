import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const colaboradorId = searchParams.get('colaborador_id');

    if (colaboradorId) {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT id, colaborador_id, descripcion,
                DATE_FORMAT(fecha_limite, '%Y-%m-%d') AS fecha_limite,
                gestionado,
                DATE_FORMAT(fecha_ejecucion, '%Y-%m-%d') AS fecha_ejecucion,
                creado_en
         FROM gestiones
         WHERE colaborador_id = ?
         ORDER BY fecha_limite ASC`,
        [colaboradorId]
      );
      const mapped = rows.map(r => ({ ...r, gestionado: r.gestionado === 1 }));
      return NextResponse.json(mapped);
    }

    // Resumen agregado por colaborador
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT
        c.id AS colaborador_id,
        c.nombre AS colaborador_nombre,
        c.apellidos AS colaborador_apellidos,
        c.cedula AS colaborador_cedula,
        b.nombre AS barrio_nombre,
        COUNT(*) AS total,
        SUM(CASE WHEN g.gestionado = 0 THEN 1 ELSE 0 END) AS pendientes,
        SUM(CASE WHEN g.gestionado = 0 AND g.fecha_limite < CURDATE() THEN 1 ELSE 0 END) AS vencidas,
        MIN(CASE WHEN g.gestionado = 0 THEN DATE_FORMAT(g.fecha_limite, '%Y-%m-%d') END) AS proxima_fecha
      FROM gestiones g
      JOIN colaboradores c ON g.colaborador_id = c.id
      LEFT JOIN barrios b ON c.barrio_id = b.id
      GROUP BY c.id, c.nombre, c.apellidos, c.cedula, b.nombre
      ORDER BY pendientes DESC, proxima_fecha ASC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener gestiones' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { colaborador_id, descripcion, fecha_limite } = body;

    if (!colaborador_id || !descripcion || !fecha_limite) {
      return NextResponse.json({ error: 'colaborador_id, descripcion y fecha_limite son requeridos' }, { status: 400 });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO gestiones (colaborador_id, descripcion, fecha_limite) VALUES (?, ?, ?)`,
      [colaborador_id, descripcion.trim(), fecha_limite]
    );

    return NextResponse.json({ id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear gestión' }, { status: 500 });
  }
}
