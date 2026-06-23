import { Robot } from '../entities/Robot';
import { Almacen } from '../entities/Almacen';

export interface EstadoRobot {
  readonly nombre: string;
  ejecutar(robot: Robot, almacen: Almacen): void;
}
