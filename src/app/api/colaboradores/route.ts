import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const liderCedula = searchParams.get('lider_cedula');

    let query = `
      SELECT c.*,
             l.nombre AS lider_nombre,
             l.apellidos AS lider_apellidos,
             h.vehiculo, h.perifoneo, h.orador_publico, h.redes_sociales,
             b.nombre AS barrio_nombre,
             co.nombre AS comuna_nombre
      FROM colaboradores c
      JOIN lideres l ON c.lider_cedula = l.cedula
      LEFT JOIN habilidades_colaborador h ON h.colaborador_id = c.id
      LEFT JOIN barrios b ON c.barrio_id = b.id
      LEFT JOIN comunas co ON b.comuna_id = co.id
    `;
    const params: string[] = [];

    if (liderCedula) {
      query += ' WHERE c.lider_cedula = ?';
      params.push(liderCedula);
    }

    query += ' ORDER BY c.apellidos, c.nombre';

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener colaboradores' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const conn = await pool.getConnection();
  try {
    const body = await req.json();
    const { cedula, nombre, apellidos, sexo, fecha_nacimiento, direccion, telefono, email, lider_cedula, barrio_id } = body;

    if (!cedula || !nombre || !apellidos || !sexo || !fecha_nacimiento || !lider_cedula) {
      return NextResponse.json({ error: 'Todos los campos requeridos deben estar completos' }, { status: 400 });
    }
    if (!['M', 'F'].includes(sexo)) {
      return NextResponse.json({ error: 'Sexo debe ser M o F' }, { status: 400 });
    }

    await conn.beginTransaction();

    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO colaboradores (cedula, nombre, apellidos, sexo, fecha_nacimiento, direccion, telefono, email, lider_cedula, barrio_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cedula.trim(), nombre.trim(), apellidos.trim(), sexo, fecha_nacimiento,
       (direccion || '').trim(), (telefono || '').trim(), (email || '').trim(),
       lider_cedula, barrio_id || null]
    );

    await conn.query(
      `INSERT INTO habilidades_colaborador (colaborador_id, vehiculo, perifoneo, orador_publico, redes_sociales)
       VALUES (?, FALSE, FALSE, FALSE, FALSE)`,
      [result.insertId]
    );

    await conn.commit();
    return NextResponse.json({ id: result.insertId, cedula, nombre, apellidos }, { status: 201 });
  } catch (error: unknown) {
    await conn.rollback();
    const mysqlError = error as { code?: string };
    if (mysqlError.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Ya existe un colaborador con esa cédula' }, { status: 409 });
    }
    if (mysqlError.code === 'ER_NO_REFERENCED_ROW_2') {
      return NextResponse.json({ error: 'El líder seleccionado no existe' }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Error al crear colaborador' }, { status: 500 });
  } finally {
    conn.release();
  }
}
