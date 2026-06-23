import { Celda } from './Celda';

export abstract class Paquete {
  constructor(
    public readonly id: string,
    public readonly peso: number,
    public readonly categoria: string,
    public posicion: Celda | null = null
  ) {}
}

export class PaqueteComestible extends Paquete {
  constructor(
    id: string,
    peso: number,
    public readonly vencimiento: Date,
    posicion: Celda | null = null
  ) {
    super(id, peso, 'COMESTIBLE', posicion);
  }
}

export class PaqueteGeneral extends Paquete {
  constructor(id: string, peso: number, posicion: Celda | null = null) {
    super(id, peso, 'GENERAL', posicion);
  }
}
