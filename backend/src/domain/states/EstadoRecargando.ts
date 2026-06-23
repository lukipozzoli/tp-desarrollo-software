import { EstadoRobot } from '../interfaces/EstadoRobot';
import { Robot } from '../entities/Robot';
import { Almacen } from '../entities/Almacen';
import { EstadoInactivo } from './EstadoInactivo';
import { EstadoOperando } from './EstadoOperando';

export class EstadoRecargando implements EstadoRobot {
  public readonly nombre = 'RECARGANDO';

  ejecutar(robot: Robot, _almacen: Almacen): void {
    robot.bateria = Math.min(100, robot.bateria + 10);

    if (robot.bateria === 100) {
      robot.estado = robot.tarea ? new EstadoOperando() : new EstadoInactivo();
    }
  }
}
