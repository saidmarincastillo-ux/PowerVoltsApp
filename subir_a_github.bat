@echo off
chcp 65001 > nul
echo ======================================================================
echo          ⚡ POWER VOLTS - SUBIR PROYECTO A GITHUB ⚡
echo ======================================================================
echo.

:: Verificar si git esta instalado
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Git no se detecto en el PATH del sistema.
    echo Por favor instala Git desde: https://git-scm.com/download/win
    echo O descarga GitHub Desktop: https://desktop.github.com/
    pause
    exit /b
)

echo [*] Inicializando repositorio Git...
git init

echo [*] Configurando rama principal como 'main'...
git branch -M main

echo [*] Agregando archivos (respetando .gitignore)...
git add .

echo [*] Creando commit inicial...
git commit -m "feat: initial commit - Power Volts Full Stack App (React Ionic + .NET Core Web API + SQLite)"

echo.
echo ======================================================================
echo [OK] Repositorio local preparado exitosamente.
echo ======================================================================
echo.
set /p REPO_URL="Pega la URL de tu repositorio de GitHub (ej: https://github.com/usuario/PowerVolts.git): "

if "%REPO_URL%"=="" (
    echo [!] No ingresaste ninguna URL. Puedes vincularlo manualmente luego con:
    echo     git remote add origin TU_URL_DE_GITHUB
    echo     git push -u origin main
) else (
    git remote remove origin 2>nul
    git remote add origin %REPO_URL%
    echo [*] Subiendo archivos a GitHub...
    git push -u origin main
    if %errorlevel% equ 0 (
      echo.
      echo [EXITO] ¡Tu codigo ha sido subido correctamente a GitHub!
    ) else (
      echo.
      echo [!] Ocurrio un error al hacer push. Verifica tus credenciales o permisos en GitHub.
    )
)

echo.
pause
