# OneMoreSpin - Docker Setup

## Wymagania
- Docker
- Docker Compose

## Instalacja Docker (jeśli nie masz)

### Ubuntu/Debian:
```bash
# Instalacja Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Dodanie użytkownika do grupy docker (żeby nie używać sudo)
sudo usermod -aG docker $USER

# Przeloguj się lub uruchom:
newgrp docker

# Instalacja Docker Compose
sudo apt install docker-compose-plugin
```

## Uruchamianie bazy danych

### 1. Uruchom PostgreSQL w Docker:
```bash
cd /home/milosz/Documents/OneMoreSpin
docker-compose up -d
```

### 2. Sprawdź status:
```bash
docker-compose ps
```

Powinieneś zobaczyć:
- `onemorespin-postgres` - port 5432
- `onemorespin-pgadmin` - port 5050 (opcjonalnie)

### 3. Zatrzymaj kontenery:
```bash
docker-compose down
```

### 4. Zatrzymaj i usuń dane (reset bazy):
```bash
docker-compose down -v
```

## Dostęp do bazy danych

### Przez terminal:
```bash
docker exec -it onemorespin-postgres psql -U OneMoreDev -d onemorespin_db
```

### Przez pgAdmin (przeglądarka):
1. Otwórz: http://localhost:5050
2. Login: `admin@onemorespin.local`
3. Hasło: `admin`
4. Dodaj serwer:
   - Host: `postgres` (nazwa kontenera)
   - Port: `5432`
   - Database: `onemorespin_db`
   - Username: `OneMoreDev`
   - Password: `Admin`

## Migracje bazy danych

Po uruchomieniu PostgreSQL, uruchom migracje:

```bash
cd OneMoreSpin.Web
dotnet ef database update
```

## Logi

```bash
# Wszystkie kontenery
docker-compose logs -f

# Tylko PostgreSQL
docker-compose logs -f postgres
```

## Connection String

Backend używa tego connection stringa (już skonfigurowany):
```
Host=localhost;Port=5432;Database=onemorespin_db;Username=OneMoreDev;Password=Admin
```

## Tworzenie testowego użytkownika

Po uruchomieniu backendu i migracji, użyj:

```bash
curl -X POST http://localhost:5046/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test123!",
    "name": "Test",
    "surname": "User",
    "dateOfBirth": "1990-01-01"
  }'
```

Potem potwierdź email (jeśli włączone) lub użyj endpointu testowego.
