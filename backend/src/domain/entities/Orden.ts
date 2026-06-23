import { Paquete } from './Paquete';

export type EstadoOrden = 'PENDIENTE' | 'COMPLETADA';

export class Orden {
  public estado: EstadoOrden = 'PENDIENTE';
  public paquete: Paquete | null = null;

  constructor(
    public readonly id: string,
    public readonly camionId: string,
    public readonly paqueteId: string,
    public readonly tipoPaquete: string,
    public readonly peso: number,
    public readonly vencimiento: Date | null
  ) {}

  public completar(): void {
    this.estado = 'COMPLETADA';
  }

  public estaCompletada(): boolean {
    return this.estado === 'COMPLETADA';
  }
}
