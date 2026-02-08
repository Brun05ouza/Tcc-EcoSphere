@echo off
echo 🚀 Iniciando EcoSphere...
echo    Backend: Supabase (não precisa rodar localmente)
echo.

echo 📦 Instalando dependências do Frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências do frontend
    pause
    exit /b 1
)

echo.
echo ✅ Dependências instaladas!
echo 🌐 Iniciando Frontend...
echo.
start "EcoSphere Frontend" cmd /k "npm start"

echo.
echo ✅ EcoSphere iniciado!
echo 🌐 Frontend: http://localhost:3000
echo.
echo 💡 Opcional: para usar o ai-service (classificação por servidor), em outro terminal:
echo    cd ai-service
echo    pip install -r requirements.txt
echo    python app.py
echo.
pause
