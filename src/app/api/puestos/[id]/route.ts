import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { zona_id, codigo, nombre, direccion, num_mesas } = await req.json();
    if (!zona_id || !codigo?.trim() || !nombre?.trim()) {
      return NextResponse.json({ error: 'zona_id, código y nombre son requeridos' }, { status: 400 });
    }
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE puestos_votacion SET zona_id=?, codigo=?, nombre=?, direccion=?, num_mesas=? WHERE id=?`,
      [zona_id, codigo.trim().padStart(2, '0'), nombre.trim(),
       (direccion || '').trim(), Number(num_mesas) || 0, params.id]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Puesto no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Ya existe un puesto con ese código en la zona' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Error al actualizar puesto' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM puestos_votacion WHERE id = ?', [params.id]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Puesto no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al eliminar puesto' }, { status: 500 });
  }
}
