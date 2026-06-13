import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM lideres WHERE id = ?',
      [params.id]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Líder no encontrado' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener líder' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { cedula, nombre, apellidos, direccion, telefono } = body;

    if (!cedula || !nombre || !apellidos) {
      return NextResponse.json({ error: 'Cédula, nombre y apellidos son requeridos' }, { status: 400 });
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE lideres SET cedula=?, nombre=?, apellidos=?, direccion=?, telefono=? WHERE id=?',
      [cedula.trim(), nombre.trim(), apellidos.trim(), (direccion || '').trim(), (telefono || '').trim(), params.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Líder no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const mysqlError = error as { code?: string };
    if (mysqlError.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Ya existe un líder con esa cédula' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Error al actualizar líder' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [colRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM colaboradores c JOIN lideres l ON c.lider_cedula = l.cedula WHERE l.id = ?',
      [params.id]
    );
    if ((colRows[0] as { total: number }).total > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar: el líder tiene colaboradores asignados' },
        { status: 409 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>('DELETE FROM lideres WHERE id = ?', [params.id]);
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Líder no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al eliminar líder' }, { status: 500 });
  }
}
