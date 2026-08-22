# Guía del Proyecto y Directrices de Desarrollo (GEMINI.md)

Este archivo actúa como el manual de instrucciones y memoria técnica para el desarrollo en el backend de **Invoice System Management (server)**. Está dirigido tanto a desarrolladores como a agentes de inteligencia artificial (como Gemini CLI) para garantizar la coherencia arquitectónica, el cumplimiento de estándares y flujos de trabajo consistentes.

---

## 🛠️ Stack Tecnológico

- **Entorno de Ejecución:** Node.js (configurado con ES Modules `"type": "module"` en `package.json`).
- **Servidor Web:** Express.js (v5+ para APIs REST).
- **Base de Datos:** MongoDB mediante Mongoose.
- **Inteligencia Artificial:** SDK Oficial de Gemini (`@google/genai` v2.16+) utilizando el modelo `gemini-2.5-flash` para extracción estructurada de datos.
- **Pruebas Unitarias y de Integración:** Jest (v30+) y Supertest.

---

## 📁 Estructura del Proyecto

```text
server/
├── __tests__/            # Pruebas unitarias e integración (Jest + Supertest)
├── src/
│   ├── config/           # Configuración centralizada de variables de entorno
│   │   └── keys.js
│   ├── middleware/       # Middlewares de Express (Autenticación, validación, etc.)
│   │   └── authMiddleware.js
│   ├── models/           # Modelos de Mongoose (User, etc.)
│   │   └── User.js
│   ├── routes/           # Enrutadores de Express agrupados por dominio
│   │   ├── authRoutes.js
│   │   ├── reportsRoutes.js
│   │   └── scanRoutes.js
│   ├── services/         # Lógica de negocio y servicios externos
│   │   ├── db.js         # Conexión a MongoDB
│   │   ├── gemini.js     # Integración con Gemini AI para escaneo de facturas
│   │   └── reports.js    # Generación y lógica de reportes
│   └── index.js          # Punto de entrada de la aplicación
├── package.json
└── jest.config.js
```

---

## 📐 Convenciones de Código y Arquitectura

### 1. Uso de ES Modules (ESM)
* **Extensiones obligatorias:** Debido a la configuración nativa de ESM, **todas las importaciones relativas locales de JavaScript deben incluir explícitamente la extensión `.js`**.
  * ❌ *Incorrecto:* `import { connectDB } from "./services/db";`
  *  *Correcto:* `import { connectDB } from "./services/db.js";`
* **Exportaciones:** Preferir exportaciones nombradas (`export const...` o `export function...`) para lógica de negocio y utilidades, a menos que un patrón requiera exportación por defecto (como en el servidor Express central en `index.js`).

### 2. Gestión de Configuración y Secretos
* **Variables de Entorno:** Todas las variables confidenciales o dependientes del entorno se almacenan en un archivo `.env` en la raíz (nunca commiteado).
* **Acceso Seguro:** Se debe acceder a ellas exclusivamente a través de `src/config/keys.js`, que centraliza y exporta `protectedKeys`. Nunca uses `process.env` directamente en servicios o controladores de rutas.

### 3. Conexión y Gestión de MongoDB/Mongoose
* La base de datos es inicializada asíncronamente en `src/index.js` llamando a `connectDB()` de `src/services/db.js`.
* Si la conexión falla y no estamos en un entorno de pruebas, el servidor detiene su ejecución con `process.exit(1)`.

### 4. Integración con Gemini AI (`@google/genai`)
* **Modelo:** Se utiliza exclusivamente `gemini-2.5-flash` por su alta velocidad y bajo coste.
* **Extracción Estructurada:** Para analizar facturas y recibos (`analyzeReceip`), **siempre** se debe configurar la propiedad `responseSchema` en la llamada a `models.generateContent` para obligar al modelo a responder con un JSON válido estructurado bajo la forma definida (ver `src/services/gemini.js`). Esto evita la necesidad de parsear con expresiones regulares.

---

##  Estrategia de Pruebas (Testing)

### 1. Configuración de Jest con ES Modules
El proyecto ejecuta Jest en modo experimental de módulos ES utilizando la bandera `--experimental-vm-modules`. Los comandos de prueba se ejecutan como:
* `npm test`: Ejecuta toda la suite de pruebas.
* `npm run test:report`: Ejecuta pruebas y genera reporte de cobertura.

### 2. Mocking en ES Modules (¡Muy Importante!)
Dado que utilizamos ESM nativo, el mocking clásico de CommonJS con `jest.mock()` no funciona de forma convencional. Debes seguir este patrón para burlar módulos:
1. Usar `jest.unstable_mockModule` antes de importar el archivo bajo prueba.
2. Registrar los mocks.
3. Importar dinámicamente el módulo que se va a testear usando `await import(...)`.

*Ejemplo de Test en ESM:*
```javascript
import { jest } from '@jest/globals';

// 1. Definir mocks del módulo externo
const mockGenerateContent = jest.fn();
jest.unstable_mockModule('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
}));

// 2. Importar el servicio dinámicamente DESPUÉS del mock
const { analyzeReceip } = await import('../src/services/gemini.js');

describe('Prueba de Gemini', () => {
  it('funciona correctamente', async () => {
    // ... tu prueba ...
  });
});
```

### 3. Cobertura y Buenas Prácticas de Test
* **Mocks Limpios:** Ejecutar siempre `jest.clearAllMocks()` en un bloque `beforeEach` para evitar fugas de estado entre aserciones.
* **Sin Llamadas Reales:** Nunca realizar peticiones HTTP reales a la API de Gemini o correos reales en pruebas unitarias; todos los servicios externos deben mocked en los archivos de test correspondientes.

---

## 🚀 Comandos Disponibles

- `npm run server`: Levanta el servidor Express en modo desarrollo utilizando `nodemon`.
- `npm test`: Ejecuta la suite completa de pruebas unitarias.
- `npm run test:report`: Ejecuta pruebas con reporte de cobertura (`coverage/`).
