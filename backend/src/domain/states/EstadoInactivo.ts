import { EstadoRobot } from '../interfaces/EstadoRobot';
import { Robot } from '../entities/Robot';
import { Almacen } from '../entities/Almacen';
import { Estanteria, Muelle, Pasillo } from '../entities/Celda';

export class EstadoInactivo implements EstadoRobot {
  public readonly nombre = 'INACTIVO';

  ejecutar(robot: Robot, almacen: Almacen): void {
    const celda = robot.posicion;
    if (celda instanceof Muelle || celda instanceof Estanteria) {
      robot.moverHaciaPasilloMasCercano(almacen);
    }
  }
}
