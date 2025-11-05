#!/bin/bash
# Skrypt do instalacji i konfiguracji PostgreSQL

echo "=== Instalacja PostgreSQL ==="
sudo apt update
sudo apt install -y postgresql postgresql-contrib

echo "=== Uruchamianie PostgreSQL ==="
sudo systemctl start postgresql
sudo systemctl enable postgresql

echo "=== Tworzenie bazy danych i użytkownika ==="
sudo -u postgres psql << EOF
-- Tworzenie użytkownika
CREATE USER "OneMoreDev" WITH PASSWORD 'Admin';

-- Tworzenie bazy danych
CREATE DATABASE onemorespin_db OWNER "OneMoreDev";

-- Nadanie uprawnień
GRANT ALL PRIVILEGES ON DATABASE onemorespin_db TO "OneMoreDev";

\q
EOF

echo "✅ PostgreSQL skonfigurowany!"
echo "Teraz zaktualizuj connection string w appsettings.json na:"
echo '"Host=localhost;Port=5432;Database=onemorespin_db;Username=OneMoreDev;Password=Admin;Include Error Detail=true"'
