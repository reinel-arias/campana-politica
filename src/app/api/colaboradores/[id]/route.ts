import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT c.*,
             l.nombre AS lider_nombre, l.apellidos AS lider_apellidos,
             h.vehiculo, h.perifoneo, h.orador_publico, h.redes_sociales,
             b.nombre AS barrio_nombre, b.comuna_id,
             co.nombre AS comuna_nombre
      FROM colaboradores c
      JOIN lideres l ON c.lider_cedula = l.cedula
      LEFT JOIN habilidades_colaborador h ON h.colaborador_id = c.id
      LEFT JOIN barrios b ON c.barrio_id = b.id
      LEFT JOIN comunas co ON b.comuna_id = co.id
      WHERE c.id = ?
    `, [params.id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Colaborador no encontrado' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener colaborador' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const conn = await pool.getConnection();
  try {
    const body = await req.json();
    const { cedula, nombre, apellidos, sexo, fecha_nacimiento, direccion, telefono, email, lider_cedula, barrio_id, habilidades } = body;

    if (!cedula || !nombre || !apellidos || !sexo || !fecha_nacimiento || !lider_cedula) {
      return NextResponse.json({ error: 'Todos los campos requeridos deben estar completos' }, { status: 400 });
    }

    await conn.beginTransaction();

    const [result] = await conn.query<ResultSetHeader>(
      `UPDATE colaboradores SET cedula=?, nombre=?, apellidos=?, sexo=?, fecha_nacimiento=?,
       direccion=?, telefono=?, email=?, lider_cedula=?, barrio_id=? WHERE id=?`,
      [cedula.trim(), nombre.trim(), apellidos.trim(), sexo, fecha_nacimiento,
       (direccion || '').trim(), (telefono || '').trim(), (email || '').trim(),
       lider_cedula, barrio_id || null, params.id]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return NextResponse.json({ error: 'Colaborador no encontrado' }, { status: 404 });
    }

    if (habilidades) {
      const { vehiculo = false, perifoneo = false, orador_publico = false, redes_sociales = false } = habilidades;
      await conn.query(
        `INSERT INTO habilidades_colaborador (colaborador_id, vehiculo, perifoneo, orador_publico, redes_sociales)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE vehiculo=VALUES(vehiculo), perifoneo=VALUES(perifoneo),
           orador_publico=VALUES(orador_publico), redes_sociales=VALUES(redes_sociales)`,
        [params.id, vehiculo, perifoneo, orador_publico, redes_sociales]
      );
    }

    await conn.commit();
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    await conn.rollback();
    const mysqlError = error as { code?: string };
    if (mysqlError.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Ya existe un colaborador con esa cédula' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Error al actualizar colaborador' }, { status: 500 });
  } finally {
    conn.release();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM colaboradores WHERE id = ?', [params.id]);
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Colaborador no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al eliminar colaborador' }, { status: 500 });
  }
}
