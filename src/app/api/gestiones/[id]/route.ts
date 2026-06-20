import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { gestionado } = body;

    if (typeof gestionado !== 'boolean') {
      return NextResponse.json({ error: 'gestionado debe ser boolean' }, { status: 400 });
    }

    const fechaEjecucion = gestionado ? new Date().toISOString().slice(0, 10) : null;

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE gestiones SET gestionado = ?, fecha_ejecucion = ? WHERE id = ?`,
      [gestionado ? 1 : 0, fechaEjecucion, params.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Gestión no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, fecha_ejecucion: fechaEjecucion });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al actualizar gestión' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM gestiones WHERE id = ?`,
      [params.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Gestión no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al eliminar gestión' }, { status: 500 });
  }
}
