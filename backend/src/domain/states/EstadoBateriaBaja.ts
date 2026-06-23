import { EstadoRobot } from '../interfaces/EstadoRobot';
import { Robot } from '../entities/Robot';
import { Almacen } from '../entities/Almacen';
import { EstadoRecargando } from './EstadoRecargando';
import { BaseCarga } from '../entities/Celda';

export class EstadoBateriaBaja implements EstadoRobot {
  public readonly nombre = 'BATERIA_BAJA';

  ejecutar(robot: Robot, almacen: Almacen): void {
    const base = robot.baseMasCercana(almacen);
    if (!base) return;

    if (robot.posicion === base) {
      robot.estado = new EstadoRecargando();
    } else {
      robot.moverHacia(base, almacen);
    }
  }
}
