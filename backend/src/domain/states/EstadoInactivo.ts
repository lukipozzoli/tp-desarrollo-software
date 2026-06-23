import { EstadoRobot } from '../interfaces/EstadoRobot';
import { Robot } from '../entities/Robot';
import { Almacen } from '../entities/Almacen';
import { Estanteria, Muelle, BaseCarga } from '../entities/Celda';
import { EstadoRecargando } from './EstadoRecargando';

export class EstadoInactivo implements EstadoRobot {
  public readonly nombre = 'INACTIVO';

  ejecutar(robot: Robot, almacen: Almacen): void {
    const celda = robot.posicion;
    if (celda instanceof BaseCarga && robot.bateria < 100) {
      robot.estado = new EstadoRecargando();
      return;
    }
    if (celda instanceof Muelle || celda instanceof Estanteria) {
      robot.moverHaciaPasilloMasCercano(almacen);
    }
  }
}
