import { Celda } from '../entities/Celda';
import { Almacen } from '../entities/Almacen';

export interface IEstrategiaNavegacion {
  siguientePaso(origen: Celda, destino: Celda, almacen: Almacen): Celda | null;
}
