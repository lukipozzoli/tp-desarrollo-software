import { EstadoRobot } from '../interfaces/EstadoRobot';
import { Robot } from '../entities/Robot';
import { Almacen } from '../entities/Almacen';
import { EstadoBateriaBaja } from './EstadoBateriaBaja';
import { EstadoInmovilizado } from './EstadoInmovilizado';
import { EstadoInactivo } from './EstadoInactivo';
import { Estanteria, Muelle } from '../entities/Celda';

export class EstadoOperando implements EstadoRobot {
  public readonly nombre = 'OPERANDO';

  ejecutar(robot: Robot, almacen: Almacen): void {
    if (!robot.tarea) return;

    if (robot.necesitaRecargar(almacen)) {
      robot.estado = new EstadoBateriaBaja();
      robot.estado.ejecutar(robot, almacen);
      return;
    }

    if (robot.bateria <= 0) {
      robot.estado = new EstadoInmovilizado();
      return;
    }

    const destino = robot.tarea.destino;

    if (robot.posicion === destino) {
      robot.realizarOperacion();
      if (!robot.tarea) {
        robot.estado = new EstadoInactivo();
      }
    } else {
      robot.moverHacia(destino, almacen);
    }
  }
}
