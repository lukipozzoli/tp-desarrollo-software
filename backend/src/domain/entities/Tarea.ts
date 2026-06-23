import { Celda } from './Celda';
import { Orden } from './Orden';

export type TipoTarea = 'BUSCAR' | 'DEPOSITAR';

export class Tarea {
  constructor(
    public readonly id: string,
    public readonly tipo: TipoTarea,
    public readonly orden: Orden,
    public readonly origen: Celda,
    public readonly destino: Celda
  ) {}
}
//Todos los otros tipos ya estan definidos entonces se asegura una cierta coherencia.