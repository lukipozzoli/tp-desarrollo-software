import { EstadoRobot } from '../interfaces/EstadoRobot';
import { Robot } from '../entities/Robot';
import { Almacen } from '../entities/Almacen';

export class EstadoInmovilizado implements EstadoRobot {
  public readonly nombre = 'INMOVILIZADO';

  ejecutar(_robot: Robot, _almacen: Almacen): void {
    // sin batería, no hace nada
  }
}
