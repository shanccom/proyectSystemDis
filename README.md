# Arquitectura — Sistema de Votación Electrónica Distribuido

## Visión general

El sistema está diseñado como una **arquitectura de microservicios orientada a eventos**, construida completamente en **Java (Spring Boot)** en el backend, con un frontend en **React**. Cada servicio es independiente, tiene su propia base de datos y se comunica con los demás a través del **API Gateway** (síncrono) o del **Message Broker** (asíncrono).

Diagrama completo: [`architecture.mermaid`](./architecture.mermaid)

---

## Componentes

### Frontend
- **React (Vite)**: aplicación web para votantes y administradores. Consume el sistema únicamente a través del API Gateway, vía HTTPS/REST.

### API Gateway
- **Spring Cloud Gateway**: punto de entrada único al sistema.
- Responsabilidades: autenticación JWT, autorización, rate limiting, enrutamiento hacia los microservicios, logging centralizado.

### Microservicios (Spring Boot)

| Servicio | Responsabilidad | Base de datos |
|---|---|---|
| **Auth Service** | Registro, login, generación y validación de JWT | Auth DB (PostgreSQL) |
| **Voting Service** | Emisión de votos, validación de reglas electorales, publicación de eventos | Voting DB (PostgreSQL) |
| **Admin Service** | Consumo de eventos, cálculo de resultados, consultas (read model) | Admin DB (PostgreSQL) |

Cada servicio tiene **su propia base de datos** (Database-per-Service), lo que evita acoplamiento a nivel de datos y permite escalar cada uno de forma independiente.

### Message Broker
- **RabbitMQ**: desacopla al Voting Service del Admin Service. Cuando se emite un voto, el evento se publica al broker y el Admin Service lo consume para actualizar resultados de forma asíncrona (**consistencia eventual**). Se eligió RabbitMQ sobre Kafka por rapidez de puesta en marcha (un solo container, configuración mínima) sin perder el concepto de mensajería asíncrona.

### Registro inmutable (blockchain-lite)
- En vez de un framework de blockchain real (que requiere días para configurarse correctamente), cada voto en Voting DB guarda el **hash del voto anterior**, formando una cadena verificable. Cualquier alteración de un voto histórico rompe la cadena de hashes, cumpliendo el mismo principio de inmutabilidad que pide el enunciado, con una fracción del esfuerzo de implementación.

### Observabilidad
- **Prometheus** (métricas) + **Grafana** (dashboards), integrados vía Spring Boot Actuator + Micrometer. Se dejó fuera del alcance de 1 día el stack ELK y el tracing distribuido (Zipkin), por ser configuraciones más pesadas que no aportan puntos adicionales de la rúbrica.

---

## Conceptos de Sistemas Distribuidos aplicados

Estos tres puntos son los que conectan directamente la arquitectura con los temas del curso:

### 1. Coordinación y acuerdo
Se usa **Redis + Redisson** para implementar un **lock distribuido**. Esto es necesario porque puede haber varias instancias del Voting Service corriendo a la vez; el sistema necesita que **solo una** pueda ejecutar el cierre oficial de la votación, evitando condiciones de carrera entre réplicas. Redis se eligió sobre Zookeeper porque cumple el mismo concepto (exclusión mutua distribuida) con muchísima menos complejidad operativa para un día de trabajo.

### 2. Transacciones y control de concurrencia
Como cada servicio tiene su propia base de datos, no se puede usar una transacción ACID tradicional entre Voting Service y Admin Service. Se aplica el **patrón Saga coreografiada** (basada en eventos de RabbitMQ, sin orquestador central): el voto se registra localmente en Voting DB, se publica un evento, y el Admin Service lo procesa; si algo falla, se ejecuta una compensación. Además, se usa **control optimista de concurrencia** (`@Version` de JPA) para evitar que un mismo votante emita dos votos en una condición de carrera.

### 3. Sistema de archivos distribuido
Se usa **MinIO** (compatible con la API de S3) para almacenar de forma replicada las actas de resultados, respaldos y logs de auditoría. Se eligió sobre HDFS porque se levanta con un solo container Docker y expone la misma semántica de almacenamiento distribuido de objetos.

---

## Flujo principal (emitir un voto)

1. El votante inicia sesión → Auth Service valida credenciales y devuelve un JWT.
2. El votante emite su voto desde el frontend → pasa por el API Gateway → llega al Voting Service.
3. Voting Service valida las reglas (elección activa, votante no ha votado antes) y guarda el voto en Voting DB.
4. Voting Service publica un evento de "voto emitido" al Message Broker.
5. Admin Service consume el evento y actualiza el conteo de resultados.
6. El votante o auditor puede consultar resultados a través del Admin Service.

---

## Por qué esta arquitectura y no un monolito

- **Disponibilidad**: si el Admin Service falla, los votantes siguen pudiendo votar (Voting Service sigue operativo); los resultados se actualizan cuando el servicio se recupera.
- **Escalabilidad independiente**: el Voting Service (alta carga durante la votación) puede escalar sin necesidad de escalar Auth o Admin.
- **Aislamiento de fallos**: un error en el cálculo de resultados no compromete el registro de votos.
