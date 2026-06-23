import { CamionDTO, MapaConfigDTO, RobotConfigDTO } from '../infrastructure/dtos';
import { Almacen } from '../domain/entities/Almacen';
import { Camion } from '../domain/entities/Camion';
import { Orden } from '../domain/entities/Orden';
import { Robot } from '../domain/entities/Robot';
import { Tarea } from '../domain/entities/Tarea';
import { Estanteria, Muelle, BaseCarga, Pasillo } from '../domain/entities/Celda';
import { EstadoInactivo } from '../domain/states/EstadoInactivo';
import { EstadoOperando } from '../domain/states/EstadoOperando';

export class ControladorAlmacen {
  private almacen!: Almacen;
  private robots: Robot[] = [];
  private camiones: Camion[] = [];
  private ordenesLibres: Orden[] = [];
  private contadorTareas: number = 0;

  public inicializar(mapaConfig: MapaConfigDTO, robotsConfig: RobotConfigDTO[]): void {
    this.almacen = new Almacen(mapaConfig.dimensiones.width, mapaConfig.dimensiones.height);

    // Poblar todas las celdas como pasillo primero
    for (let y = 0; y < mapaConfig.dimensiones.height; y++) {
      for (let x = 0; x < mapaConfig.dimensiones.width; x++) {
        this.almacen.agregarCelda(new Pasillo(x, y));
      }
    }

    // Sobreescribir con los tipos especiales
    for (const e of mapaConfig.estanterias) {
      this.almacen.agregarCelda(new Estanteria(e.x, e.y));
    }
    for (const m of mapaConfig.muelles) {
      this.almacen.agregarCelda(new Muelle(m.x, m.y, m.id));
    }
    for (const b of mapaConfig.basesCarga) {
      this.almacen.agregarCelda(new BaseCarga(b.x, b.y, b.id));
    }

    // Crear robots
    for (const r of robotsConfig) {
      const celda = this.almacen.getCelda(r.x, r.y);
      if (!celda) continue;
      const robot = new Robot(r.id, celda, r.bateria);
      celda.ocupada = true;
      this.robots.push(robot);
    }
  }

  public onCamionLlega(camionDTO: CamionDTO): void {
    const muelle = this.almacen.getMuelle(camionDTO.muelleId);
    if (!muelle) return;

    const camion = new Camion(camionDTO.id, camionDTO.tipo, muelle, camionDTO.tickLlegada);
    muelle.acoplado = true;

    for (const o of camionDTO.ordenes) {
      const orden = new Orden(o.id, o.camionId, o.paqueteId, o.tipoPaquete, o.peso,
        o.vencimiento ? new Date(o.vencimiento) : null);
      camion.agregarOrden(orden);
    }

    this.camiones.push(camion);
  }

  public procesarPaso(): void {
    // 1. Liberar órdenes de camiones ACOPLADOS → OPERATIVO
    for (const camion of this.camiones) {
      if (camion.estado === 'ACOPLADO') {
        camion.estado = 'OPERATIVO';
        this.ordenesLibres.push(...camion.ordenesActivas());
      }
    }

    // 2. Asignar órdenes a robots INACTIVOS
    this.asignarOrdenes();

    // 3. Cada robot ejecuta su acción
    for (const robot of this.robots) {
      robot.ejecutarAccion(this.almacen);
    }

    // 3b. Crear segunda tarea para robots que completaron la primera mitad
    for (const robot of this.robots) {
      if (robot.tarea || !robot.ultimaTarea) continue;
      if (robot.ultimaTarea.tipo === 'BUSCAR' && !robot.ultimaTarea.orden.estaCompletada()) {
        this.crearTareaDepositar(robot, robot.ultimaTarea.orden);
        robot.ultimaTarea = null;
      }
    }

    // 4. Retirar camiones con órdenes completadas
    for (const camion of this.camiones) {
      if (camion.estado === 'RETIRADO') continue;
      if (camion.todasCompletadas()) {
        const hayRobotEncima = this.robots.some(r => r.posicion === camion.muelle);
        if (hayRobotEncima) {
          camion.estado = 'LISTO';
        } else {
          camion.estado = 'RETIRADO';
          camion.muelle.acoplado = false;
        }
      }
    }
  }

  private asignarOrdenes(): void {
    const ordenesOrdenadas = [...this.ordenesLibres].sort((a, b) => {
      const aComestible = a.tipoPaquete === 'COMESTIBLE';
      const bComestible = b.tipoPaquete === 'COMESTIBLE';

      if (aComestible && !bComestible) return -1;
      if (!aComestible && bComestible) return 1;

      if (aComestible && bComestible) {
        return (a.vencimiento?.getTime() ?? 0) - (b.vencimiento?.getTime() ?? 0);
      }

      return b.peso - a.peso;
    });

    for (const robot of this.robots) {
      if (!(robot.estado instanceof EstadoInactivo)) continue;
      if (robot.tarea) continue;

      const celda = robot.posicion;
      if (celda instanceof Muelle || celda instanceof Estanteria) continue;

      const orden = ordenesOrdenadas.find(o => !o.estaCompletada());
      if (!orden) break;

      this.asignarOrdenARobot(robot, orden);
      this.ordenesLibres = this.ordenesLibres.filter(o => o !== orden);
    }
  }

  private asignarOrdenARobot(robot: Robot, orden: Orden): void {
    const camion = this.camiones.find(c => c.id === orden.camionId);
    if (!camion) return;

    let tarea: Tarea;
    const idTarea = `T${++this.contadorTareas}`;

    if (camion.tipo === 'RECEPCION') {
      const estanteria = this.almacen.getEstanteriasVacias().find(e => !e.reservada);
      if (!estanteria) return;
      estanteria.reservada = robot;
      tarea = new Tarea(idTarea, 'BUSCAR', orden, camion.muelle, estanteria);
    } else {
      const estanteria = this.almacen.getEstanterias()
        .find(e => e.paquetes.some(p => p.id === orden.paqueteId));
      if (!estanteria) return;
      estanteria.reservada = robot;
      tarea = new Tarea(idTarea, 'BUSCAR', orden, estanteria, camion.muelle);
    }

    robot.tarea = tarea;
    robot.estado = new EstadoOperando();
  }

  private crearTareaDepositar(robot: Robot, orden: Orden): void {
    const camion = this.camiones.find(c => c.id === orden.camionId);
    if (!camion) return;

    const idTarea = `T${++this.contadorTareas}`;

    if (camion.tipo === 'RECEPCION') {
      const estanteria = this.almacen.getEstanteriasVacias().find(e => !e.reservada);
      if (!estanteria) return;
      estanteria.reservada = robot;
      robot.tarea = new Tarea(idTarea, 'DEPOSITAR', orden, camion.muelle, estanteria);
    } else {
      camion.muelle.reservada = robot;
      robot.tarea = new Tarea(idTarea, 'DEPOSITAR', orden, robot.posicion, camion.muelle);
    }
  }

  public obtenerEstado(): object {
    return {
      dimensiones: { width: this.almacen.width, height: this.almacen.height },
      robots: this.robots.map(r => ({
        x: r.posicion.x,
        y: r.posicion.y,
        estado: r.estado.nombre,
        carga: !!r.carga,
      })),
      camiones: this.camiones
        .filter(c => c.estado !== 'RETIRADO')
        .map(c => ({ x: c.x, y: c.y, tipo: c.tipo })),
      estanterias: this.almacen.getEstanterias().map(e => ({
        x: e.x,
        y: e.y,
        paquetes: e.paquetes,
      })),
      basesCarga: this.almacen.getBasesCarga().map(b => ({ x: b.x, y: b.y })),
    };
  }
}
