# Guia de Arquitectura

## Estructura del proyecto

```
proyectSystemDis/
├── backend/
│   ├── gateway-service/         # Spring Cloud Gateway (puerto 8080)
│   ├── auth-service/            # Auth Service (puerto 8081)
│   ├── voting-service/          # Voting Service (puerto 8082)
│   └── admin-service/           # Admin Service (puerto 8083)
├── frontend/                    # React + Vite (puerto 5173)
├── docker/
│   ├── init/
│   │   ├── auth-db/init.sql     # Schema de Auth DB
│   │   ├── voting-db/init.sql   # Schema de Voting DB
│   │   └── admin-db/init.sql    # Schema de Admin DB
│   ├── prometheus/prometheus.yml
│   └── grafana/datasources.yml
├── docker-compose.yml           # Toda la infraestructura
└── architecture.mermaid         # Diagrama de arquitectura
```

## Infraestructura (docker-compose)

| Servicio     | Puerto  | Descripcion                          |
|-------------|---------|--------------------------------------|
| auth-db     | 5432    | PostgreSQL - Auth Service            |
| voting-db   | 5433    | PostgreSQL - Voting Service          |
| admin-db    | 5434    | PostgreSQL - Admin Service           |
| rabbitmq    | 5672    | Message Broker (15672 management)    |
| redis       | 6379    | Lock distribuido (Redisson)          |
| minio       | 9000    | S3-compatible storage (9001 console) |
| prometheus  | 9090    | Metricas                             |
| grafana     | 3000    | Dashboards                           |

## Comunicacion entre servicios

- **Sincrona**: A traves del API Gateway (Spring Cloud Gateway)
- **Asincrona**: Via RabbitMQ (eventos de voto)
- **Flujo**: Frontend → Gateway → Voting Service → RabbitMQ → Admin Service

## Conceptos de SD aplicados

1. **Coordinacion**: Redis + Redisson (lock distribuido para cierre de eleccion)
2. **Transacciones**: Saga coreografiada via RabbitMQ + @Version JPA
3. **Sistema archivos distribuido**: MinIO para actas y respaldos
4. **Inmutabilidad**: Hash-chain en Voting DB (blockchain-lite)

## Para desarrollar

```bash
# Iniciar toda la infraestructura
docker compose up -d

# Ver logs de un servicio especifico
docker compose logs -f voting-service

# Detener todo
docker compose down

# Reconstruir y arrancar un servicio
docker compose up -d --build voting-service
```
