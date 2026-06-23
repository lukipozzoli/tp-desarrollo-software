import { IEstrategiaNavegacion } from '../interfaces/IEstrategiaNavegacion';
import { Celda } from '../entities/Celda';
import { Almacen } from '../entities/Almacen';

export class MovimientoEnL implements IEstrategiaNavegacion {
  siguientePaso(origen: Celda, destino: Celda, almacen: Almacen): Celda | null {
    let nextX = origen.x;
    let nextY = origen.y;

    if (origen.x !== destino.x) {
      nextX += origen.x < destino.x ? 1 : -1;
    } else if (origen.y !== destino.y) {
      nextY += origen.y < destino.y ? 1 : -1;
    }

    const celda = almacen.getCelda(nextX, nextY);
    if (!celda || celda.ocupada) return null;
    return celda;
  }
}
