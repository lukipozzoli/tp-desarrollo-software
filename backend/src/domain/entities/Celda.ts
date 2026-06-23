import { Paquete } from './Paquete';

export type TipoCelda = 'PASILLO' | 'ESTANTERIA' | 'MUELLE' | 'BASE_CARGA';

//Hacemos una clase abstracta porque va a ser usada por varias clases concretas para cada tipo de celda distinto
export abstract class Celda {
  public ocupada: boolean = false;
  public reservada: any | null = null;

  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly tipo: TipoCelda //Se asegura que no haya error de tipo
  ) {}
}
//No marcamos estados de ocupada o reservada porque ya estan definidos en la clase abstracta
export class Pasillo extends Celda {
  constructor(x: number, y: number) {
    super(x, y, 'PASILLO');
  }
}

export class Estanteria extends Celda {
  public paquetes: Paquete[] = [];

  constructor(x: number, y: number) {
    super(x, y, 'ESTANTERIA');
  }

  public estaVacia(): boolean {
    return this.paquetes.length === 0;
  }
//Le agrego una validacion para controlar que solo puede haber un paquete en la estanteria. Antes confiaba en el ControladorAlmacen. Esta "redundancia" se llama programacion defensiva
  public depositar(paquete: Paquete): void {
    if (!this.estaVacia()) {
      throw new Error(`Estanteria (${this.x},${this.y}) ya tiene un paquete`);
    }
    this.paquetes.push(paquete);
    paquete.posicion = this;
  }

  public retirar(): Paquete | null {
    if (this.paquetes.length === 0) return null;
    const paquete = this.paquetes.pop()!;
    paquete.posicion = null;
    return paquete;
  }
}

export class Muelle extends Celda {
  public readonly id: string;
  public acoplado: boolean = false;

  constructor(x: number, y: number, id: string) {
    super(x, y, 'MUELLE');
    this.id = id;
  }
}

export class BaseCarga extends Celda {
  public readonly id: string;

  constructor(x: number, y: number, id: string) {
    super(x, y, 'BASE_CARGA');
    this.id = id;
  }
}
