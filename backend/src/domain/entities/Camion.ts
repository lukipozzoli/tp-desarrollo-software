import { Muelle } from './Celda';
import { Orden } from './Orden';

export type TipoCamion = 'RECEPCION' | 'DESPACHO';
export type EstadoCamion = 'ACOPLADO' | 'OPERATIVO' | 'LISTO' | 'RETIRADO';
//el estado PROGRAMADO lo maneja el SimuladorEntorno con su lista camionesPendientes. El camión vive ahi como un DTO hasta que llega su tick

export class Camion {
  public estado: EstadoCamion = 'ACOPLADO'; //Aca deja de ser un DTO y pasa a "existir" como camuion
  public ordenes: Orden[] = [];

  constructor(
    public readonly id: string,
    public readonly tipo: TipoCamion,
    public readonly muelle: Muelle,
    public readonly tickLlegada: number
  ) {}

  public get x(): number { return this.muelle.x; }
  public get y(): number { return this.muelle.y; }

  public agregarOrden(orden: Orden): void {
    this.ordenes.push(orden);
  }

  public todasCompletadas(): boolean {
    return this.ordenes.length > 0 && this.ordenes.every(o => o.estaCompletada());
  }

  public ordenesActivas(): Orden[] {
    return this.ordenes.filter(o => !o.estaCompletada());
  }
}
