import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT l.*, COUNT(c.id) AS total_colaboradores
      FROM lideres l
      LEFT JOIN colaboradores c ON c.lider_cedula = l.cedula
      GROUP BY l.id
      ORDER BY l.apellidos, l.nombre
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener líderes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cedula, nombre, apellidos, direccion, telefono, email, usuario, clave } = body;

    if (!cedula || !nombre || !apellidos) {
      return NextResponse.json({ error: 'Cédula, nombre y apellidos son requeridos' }, { status: 400 });
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO lideres (cedula, nombre, apellidos, direccion, telefono, email, usuario, clave) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        cedula.trim(), nombre.trim(), apellidos.trim(),
        (direccion || '').trim(), (telefono || '').trim(),
        email?.trim() || null, usuario?.trim() || null, clave?.trim() || null,
      ]
    );

    return NextResponse.json({ id: result.insertId, cedula, nombre, apellidos }, { status: 201 });
  } catch (error: unknown) {
    const mysqlError = error as { code?: string; message?: string };
    if (mysqlError.code === 'ER_DUP_ENTRY') {
      const msg = mysqlError.message?.includes('usuario') ? 'Ya existe un líder con ese usuario' : 'Ya existe un líder con esa cédula';
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Error al crear líder' }, { status: 500 });
  }
}
