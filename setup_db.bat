@echo off
cd "C:\Program Files\PostgreSQL\18\bin"
psql -U postgres -c "CREATE DATABASE salon_db;"
psql -U postgres -d salon_db -f "D:\SURYA\PROJECT-SALOON\files\schema.sql"
pause
