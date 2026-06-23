import { EstadoRobot } from '../interfaces/EstadoRobot';
import { Robot } from '../entities/Robot';
import { Almacen } from '../entities/Almacen';
import { BaseCarga } from '../entities/Celda';
import { EstadoRecargando } from './EstadoRecargando';

export class EstadoInmovilizado implements EstadoRobot {
  public readonly nombre = 'INMOVILIZADO';

  ejecutar(robot: Robot, _almacen: Almacen): void {
    if (robot.posicion instanceof BaseCarga) {
      robot.estado = new EstadoRecargando();
    }
  }
}
