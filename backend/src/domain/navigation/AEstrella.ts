import { IEstrategiaNavegacion } from '../interfaces/IEstrategiaNavegacion';
import { Celda } from '../entities/Celda';
import { Almacen } from '../entities/Almacen';
import { distanciaManhattan } from './distanciaManhattan';

interface Nodo {
  celda: Celda;
  g: number;
  h: number;
  f: number;
  padre: Nodo | null;
}

export class AEstrella implements IEstrategiaNavegacion {
  siguientePaso(origen: Celda, destino: Celda, almacen: Almacen): Celda | null {
    const abiertos: Nodo[] = [];
    const cerrados = new Set<string>();

    const heuristica = (c: Celda) => distanciaManhattan(c.x, c.y, destino.x, destino.y);
    const clave = (c: Celda) => `${c.x},${c.y}`;

    abiertos.push({ celda: origen, g: 0, h: heuristica(origen), f: heuristica(origen), padre: null });

    while (abiertos.length > 0) {
      abiertos.sort((a, b) => a.f - b.f);
      const actual = abiertos.shift()!;

      if (actual.celda === destino) {
        let nodo: Nodo = actual;
        while (nodo.padre && nodo.padre.celda !== origen) {
          nodo = nodo.padre;
        }
        return nodo.celda;
      }

      cerrados.add(clave(actual.celda));

      const vecinos = [
        almacen.getCelda(actual.celda.x + 1, actual.celda.y),
        almacen.getCelda(actual.celda.x - 1, actual.celda.y),
        almacen.getCelda(actual.celda.x, actual.celda.y + 1),
        almacen.getCelda(actual.celda.x, actual.celda.y - 1),
      ];

      for (const vecino of vecinos) {
        if (!vecino || (vecino.ocupada && vecino !== destino) || cerrados.has(clave(vecino))) continue;

        const g = actual.g + 1;
        const h = heuristica(vecino);
        abiertos.push({ celda: vecino, g, h, f: g + h, padre: actual });
      }
    }

    return null;
  }
}
