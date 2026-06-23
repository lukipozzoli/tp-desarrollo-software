Empezamos en el index.ts donde se define el path hacia la carpeta que va a actuar como back-end, es decir, la que trae los datos de carga y se llama a la primera función que es:

```typescript
const entorno = new SimuladorEntorno(dataBasePath);
```

Acá creamos una nueva instancia de la clase `SimuladorEntorno`, que a su vez implementa dentro suyo la interfaz `TickSubject`. Con ciertas funciones de observer para que otros objetos puedan recibir comunicaciones sobre los ticks sin que el simulador de entorno sepa quien o que esta consultando esa información. Este es el patron de diseño de `Observer`. 
También, dentro de `SimuladorEntorno`, creamos una nueva instancia de `ControladorAlmacen`, que va a ser la clase que se ocupa de ejecutar toda la simulación que viene cargada en los CSV. Este es uno de los que tenemos que implementar nosotros.
