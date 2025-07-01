@echo off
REM This script is used to initialize the taskprio database tables

REM Variables
set DB_USER=postgres
set DB_NAME=taskprio
set SQL_FILE=%~dp0tp_db.sql

echo Initializing taskprio database tables
echo SQL_FILE: %SQL_FILE%

psql -U %DB_USER% -d %DB_NAME% -f "%SQL_FILE%"

if %ERRORLEVEL%==0 (
    echo Database initialization succeeded.
) else (
    echo ERROR: Database initialization failed with error code %ERRORLEVEL%.
    exit /b %ERRORLEVEL%
)
pause