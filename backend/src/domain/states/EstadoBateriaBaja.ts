import { EstadoRobot } from '../interfaces/EstadoRobot';
import { Robot } from '../entities/Robot';
import { Almacen } from '../entities/Almacen';
import { EstadoRecargando } from './EstadoRecargando';
import { BaseCarga } from '../entities/Celda';

export class EstadoBateriaBaja implements EstadoRobot {
  public readonly nombre = 'BATERIA_BAJA';

  ejecutar(robot: Robot, almacen: Almacen): void {
    console.log(`[BATERIA_BAJA ${robot.id}] pos=(${robot.posicion.x},${robot.posicion.y}) tipo=${robot.posicion.constructor.name} bateria=${robot.bateria} esBase=${robot.posicion instanceof BaseCarga}`);

    // Si ya está parado en cualquier base de carga, recarga ahí directamente
    if (robot.posicion instanceof BaseCarga) {
      console.log(`[BATERIA_BAJA ${robot.id}] → transicionando a RECARGANDO`);
      robot.estado = new EstadoRecargando();
      return;
    }

    // Busca la base más cercana que no esté ocupada por otro robot
    const base = almacen.getBasesCarga()
      .filter(b => !b.ocupada)
      .sort((a, b) => {
        const da = Math.abs(robot.posicion.x - a.x) + Math.abs(robot.posicion.y - a.y);
        const db = Math.abs(robot.posicion.x - b.x) + Math.abs(robot.posicion.y - b.y);
        return da - db;
      })[0];

    if (!base) return;

    robot.moverHacia(base, almacen);
  }
}
