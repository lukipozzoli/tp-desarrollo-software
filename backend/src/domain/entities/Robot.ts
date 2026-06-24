import { Celda, BaseCarga, Estanteria, Muelle } from './Celda';
import { Paquete, PaqueteComestible, PaqueteGeneral } from './Paquete';
import { Tarea } from './Tarea';
import { Almacen } from './Almacen';
import { EstadoRobot } from '../interfaces/EstadoRobot';
import { EstadoInactivo } from '../states/EstadoInactivo';
import { EstadoInmovilizado } from '../states/EstadoInmovilizado';
import { IEstrategiaNavegacion } from '../interfaces/IEstrategiaNavegacion';
import { MovimientoEnL } from '../navigation/MovimientoEnL';
import { AEstrella } from '../navigation/AEstrella';
import { distanciaManhattan } from '../navigation/distanciaManhattan';

export class Robot {
  public estado: EstadoRobot;
  public carga: Paquete | null = null;
  public tarea: Tarea | null = null;
  public ultimaTarea: Tarea | null = null;
  public ticksBloqueado: number = 0;
  private estrategia: IEstrategiaNavegacion;

  constructor(
    public readonly id: string,
    public posicion: Celda,
    public bateria: number = 100
  ) {
    this.estado = new EstadoInactivo();
    this.estrategia = new MovimientoEnL();
  }

  public ejecutarAccion(almacen: Almacen): void {
    this.estado.ejecutar(this, almacen);
  }

  public moverHacia(destino: Celda, almacen: Almacen): void {
    const siguiente = this.estrategia.siguientePaso(this.posicion, destino, almacen);

    if (!siguiente) {
      this.ticksBloqueado++;
      if (this.ticksBloqueado >= 3) {
        this.estrategia = new AEstrella();
        this.ticksBloqueado = 0;
      }
      return;
    }

    this.ticksBloqueado = 0;
    this.estrategia = new MovimientoEnL();
    this.posicion.ocupada = false;
    siguiente.ocupada = true;
    this.posicion = siguiente;
    this.bateria -= this.carga ? 2 : 1;

    if (this.bateria <= 0) {
      this.bateria = 0;
      // Si cayó en una base de carga, recarga en vez de inmovilizarse
      const { EstadoRecargando } = require('../states/EstadoRecargando');
      this.estado = this.posicion instanceof BaseCarga ? new EstadoRecargando() : new EstadoInmovilizado();
    }
  }

  public moverHaciaPasilloMasCercano(almacen: Almacen): void {
    const vecinos = [
      almacen.getCelda(this.posicion.x + 1, this.posicion.y),
      almacen.getCelda(this.posicion.x - 1, this.posicion.y),
      almacen.getCelda(this.posicion.x, this.posicion.y + 1),
      almacen.getCelda(this.posicion.x, this.posicion.y - 1),
    ];

    const pasillo = vecinos.find(c => c && !c.ocupada && !(c instanceof Estanteria) && !(c instanceof Muelle));
    if (!pasillo) return;

    this.posicion.ocupada = false;
    pasillo.ocupada = true;
    this.posicion = pasillo;
    this.bateria -= 1;
  }

  public realizarOperacion(): void {
    if (!this.tarea) return;

    if (this.tarea.tipo === 'BUSCAR') {
      if (this.posicion instanceof Muelle) {
        // RECEPCION: el robot retira el paquete del camión → el camión ya no tiene nada que dar
        const orden = this.tarea.orden;
        this.carga = orden.tipoPaquete === 'COMESTIBLE'
          ? new PaqueteComestible(orden.paqueteId, orden.peso, orden.vencimiento!)
          : new PaqueteGeneral(orden.paqueteId, orden.peso);
        orden.completar();
      } else if (this.posicion instanceof Estanteria) {
        // DESPACHO: el robot retira el paquete de la estantería para llevarlo al camión
        this.carga = this.posicion.retirar();
      }
    } else if (this.tarea.tipo === 'DEPOSITAR') {
      if (this.posicion instanceof Estanteria && this.carga) {
        // RECEPCION: deposita en estantería (orden ya completada al retirar del muelle)
        this.posicion.depositar(this.carga);
        this.tarea.orden.paquete = this.carga;
        this.carga = null;
      } else if (this.posicion instanceof Muelle && this.carga) {
        // DESPACHO: entrega al camión → el camión ya tiene todo lo que necesita
        this.carga = null;
        this.tarea.orden.completar();
      }
    }

    this.tarea.destino.reservada = null;
    this.ultimaTarea = this.tarea;
    this.tarea = null;
  }
//Distancia "manhattan" a la base mas cercana x costo de movimiento
  public necesitaRecargar(almacen: Almacen): boolean {
    const bases = almacen.getBasesCarga().filter(b => !b.ocupada);
    if (bases.length === 0) return false;
    const distancia = Math.min(...bases.map(b =>
      distanciaManhattan(this.posicion.x, this.posicion.y, b.x, b.y)
    ));
    if (this.carga) {
      // Lleva carga: agrega 1 paso de margen porque moverse aleja de la base
      return this.bateria <= distancia * 2 + 2;
    }
    if (this.tarea?.tipo === 'BUSCAR') {
      // Sin carga pero va a buscar: anticipa el costo doble tras el pickup
      return this.bateria <= distancia * 2;
    }
    return this.bateria <= distancia;
  }

  public baseMasCercana(almacen: Almacen): BaseCarga | null {
    const bases = almacen.getBasesCarga();
    if (bases.length === 0) return null;
    return bases.reduce((cercana, base) => {
      const dActual = distanciaManhattan(this.posicion.x, this.posicion.y, base.x, base.y);
      const dCercana = distanciaManhattan(this.posicion.x, this.posicion.y, cercana.x, cercana.y);
      return dActual < dCercana ? base : cercana;
    });
  }
}
