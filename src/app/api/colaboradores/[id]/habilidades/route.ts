import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { vehiculo = false, perifoneo = false, orador_publico = false, redes_sociales = false } = await req.json();

    await pool.query(
      `INSERT INTO habilidades_colaborador (colaborador_id, vehiculo, perifoneo, orador_publico, redes_sociales)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         vehiculo=VALUES(vehiculo), perifoneo=VALUES(perifoneo),
         orador_publico=VALUES(orador_publico), redes_sociales=VALUES(redes_sociales)`,
      [params.id, vehiculo, perifoneo, orador_publico, redes_sociales]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al guardar habilidades' }, { status: 500 });
  }
}
