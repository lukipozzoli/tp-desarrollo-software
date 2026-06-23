import { Celda, Estanteria, Muelle, BaseCarga } from './Celda';

export class Almacen {
  public readonly width: number;
  public readonly height: number;
  private celdas: Map<string, Celda> = new Map();

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public agregarCelda(celda: Celda): void {
    if (celda.x < 0 || celda.x >= this.width || celda.y < 0 || celda.y >= this.height) {
      throw new Error(`Celda (${celda.x},${celda.y}) fuera de los límites del almacén`);
    }
    this.celdas.set(`${celda.x},${celda.y}`, celda);
  }

  public getCelda(x: number, y: number): Celda | undefined {
    return this.celdas.get(`${x},${y}`);
  }

  public getEstanterias(): Estanteria[] {
    return [...this.celdas.values()].filter((c): c is Estanteria => c instanceof Estanteria);
  }

  public getEstanteriasVacias(): Estanteria[] {
    return this.getEstanterias().filter(e => e.estaVacia());
  }

  public getMuelles(): Muelle[] {
    return [...this.celdas.values()].filter((c): c is Muelle => c instanceof Muelle);
  }

  public getMuelle(id: string): Muelle | undefined {
    return this.getMuelles().find(m => m.id === id);
  }

  public getBasesCarga(): BaseCarga[] {
    return [...this.celdas.values()].filter((c): c is BaseCarga => c instanceof BaseCarga);
  }
}
