@echo off
REM Script para resetear la contraseña de PostgreSQL local
REM Ejecuta esto como ADMINISTRADOR

echo ========================================
echo   Reseteo de Password PostgreSQL Local
echo ========================================
echo.

REM Ruta a psql.exe
set PSQL_PATH="C:\Program Files\PostgreSQL\18\bin\psql.exe"

echo 1. Deteniendo servicio PostgreSQL...
net stop postgresql-x64-18

echo.
echo 2. Iniciando PostgreSQL en modo trust (sin password)...
echo    Esto permite conectarse temporalmente sin contraseña

REM Backup del pg_hba.conf original
copy "C:\Program Files\PostgreSQL\18\data\pg_hba.conf" "C:\Program Files\PostgreSQL\18\data\pg_hba.conf.backup"

REM Crear pg_hba.conf temporal con trust
echo # Configuracion temporal para resetear password > "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"
echo host    all             all             127.0.0.1/32            trust >> "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"
echo host    all             all             ::1/128                 trust >> "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"

echo.
echo 3. Reiniciando servicio...
net start postgresql-x64-18

echo.
echo 4. Cambiando password a 'pass123!'...
%PSQL_PATH% -U postgres -c "ALTER USER postgres WITH PASSWORD 'pass123!';"

echo.
echo 5. Restaurando configuracion original...
copy "C:\Program Files\PostgreSQL\18\data\pg_hba.conf.backup" "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"

echo.
echo 6. Reiniciando servicio con configuracion normal...
net stop postgresql-x64-18
net start postgresql-x64-18

echo.
echo ========================================
echo   Password cambiada a: pass123!
echo   Usuario: postgres
echo   Host: localhost
echo   Puerto: 5432
echo ========================================
echo.
echo Presiona cualquier tecla para salir...
pause > nul
