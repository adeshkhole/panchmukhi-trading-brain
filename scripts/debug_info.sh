#!/bin/bash

# Panchmukhi Trading Brain - Debug Information Collector
# This script collects system information for troubleshooting

echo "🔍 Panchmukhi Trading Brain - Debug Information Collector"
echo "========================================================="

# Create debug directory
mkdir -p debug_logs
echo "📁 Debug logs will be saved to: debug_logs/"

# System Information
echo "💻 System Information" > debug_logs/system_info.txt
echo "=====================" >> debug_logs/system_info.txt
echo "Date: $(date)" >> debug_logs/system_info.txt
echo "OS: $(uname -a)" >> debug_logs/system_info.txt
echo "Architecture: $(arch)" >> debug_logs/system_info.txt
echo "Memory: $(free -h | grep Mem)" >> debug_logs/system_info.txt
echo "Disk: $(df -h / | tail -1)" >> debug_logs/system_info.txt
echo "" >> debug_logs/system_info.txt

# Docker Information
echo "🐳 Docker Information" >> debug_logs/system_info.txt
echo "=====================" >> debug_logs/system_info.txt
echo "Docker Version:" >> debug_logs/system_info.txt
docker --version >> debug_logs/system_info.txt 2>&1
echo "Docker Compose Version:" >> debug_logs/system_info.txt
docker-compose --version >> debug_logs/system_info.txt 2>&1
echo "Docker Status:" >> debug_logs/system_info.txt
sudo systemctl status docker >> debug_logs/system_info.txt 2>&1 || echo "Docker service not found" >> debug_logs/system_info.txt
echo "" >> debug_logs/system_info.txt

# Node.js Information
echo "📦 Node.js Information" >> debug_logs/system_info.txt
echo "======================" >> debug_logs/system_info.txt
echo "Node Version:" >> debug_logs/system_info.txt
node --version >> debug_logs/system_info.txt 2>&1 || echo "Node.js not found" >> debug_logs/system_info.txt
echo "NPM Version:" >> debug_logs/system_info.txt
npm --version >> debug_logs/system_info.txt 2>&1 || echo "NPM not found" >> debug_logs/system_info.txt
echo "NVM Version:" >> debug_logs/system_info.txt
nvm --version >> debug_logs/system_info.txt 2>&1 || echo "NVM not found" >> debug_logs/system_info.txt
echo "" >> debug_logs/system_info.txt

# Python Information
echo "🐍 Python Information" >> debug_logs/system_info.txt
echo "=====================" >> debug_logs/system_info.txt
echo "Python Version:" >> debug_logs/system_info.txt
python3 --version >> debug_logs/system_info.txt 2>&1 || echo "Python3 not found" >> debug_logs/system_info.txt
echo "Pip Version:" >> debug_logs/system_info.txt
pip3 --version >> debug_logs/system_info.txt 2>&1 || echo "Pip3 not found" >> debug_logs/system_info.txt
echo "Virtualenv:" >> debug_logs/system_info.txt
python3 -m venv --help >> debug_logs/system_info.txt 2>&1 || echo "Virtualenv not available" >> debug_logs/system_info.txt
echo "" >> debug_logs/system_info.txt

# Environment Variables
echo "🔧 Environment Variables" > debug_logs/env_vars.txt
echo "=======================" >> debug_logs/env_vars.txt
if [ -f .env ]; then
    echo ".env file contents:" >> debug_logs/env_vars.txt
    cat .env >> debug_logs/env_vars.txt
else
    echo "No .env file found" >> debug_logs/env_vars.txt
fi
echo "" >> debug_logs/env_vars.txt

# Port Status
echo "🔌 Port Status" > debug_logs/port_status.txt
echo "=============" >> debug_logs/port_status.txt
echo "Checking if ports are in use:" >> debug_logs/port_status.txt
for port in 3000 8080 8000 5432 6379; do
    echo "Port $port:" >> debug_logs/port_status.txt
    lsof -ti:$port >> debug_logs/port_status.txt 2>&1 || echo "  Not in use" >> debug_logs/port_status.txt
done
echo "" >> debug_logs/port_status.txt

# Docker Services Status
echo "🐳 Docker Services Status" > debug_logs/docker_status.txt
echo "========================" >> debug_logs/docker_status.txt
if command -v docker-compose &> /dev/null; then
    echo "Docker Compose Services:" >> debug_logs/docker_status.txt
    docker-compose ps >> debug_logs/docker_status.txt 2>&1
    echo "" >> debug_logs/docker_status.txt
    echo "Docker Compose Logs (last 50 lines):" >> debug_logs/docker_status.txt
    docker-compose logs --tail=50 >> debug_logs/docker_status.txt 2>&1
else
    echo "Docker Compose not available" >> debug_logs/docker_status.txt
fi

# Backend Information
echo "⚙️ Backend Information" > debug_logs/backend_info.txt
echo "=====================" >> debug_logs/backend_info.txt
if [ -d backend ]; then
    cd backend
    echo "Backend package.json:" >> ../debug_logs/backend_info.txt
    cat package.json >> ../debug_logs/backend_info.txt
    echo "" >> ../debug_logs/backend_info.txt
    echo "Node modules installed:" >> ../debug_logs/backend_info.txt
    ls node_modules 2>/dev/null | head -20 >> ../debug_logs/backend_info.txt || echo "No node_modules found" >> ../debug_logs/backend_info.txt
    cd ..
else
    echo "Backend directory not found" >> debug_logs/backend_info.txt
fi

# ML Service Information
echo "🤖 ML Service Information" > debug_logs/ml_info.txt
echo "========================" >> debug_logs/ml_info.txt
if [ -d ml-services ]; then
    cd ml-services
    echo "ML Service requirements.txt:" >> ../debug_logs/ml_info.txt
    cat requirements.txt >> ../debug_logs/ml_info.txt
    echo "" >> ../debug_logs/ml_info.txt
    echo "Python packages installed:" >> ../debug_logs/ml_info.txt
    pip list 2>/dev/null | head -20 >> ../debug_logs/ml_info.txt || echo "Pip list failed" >> ../debug_logs/ml_info.txt
    cd ..
else
    echo "ML Services directory not found" >> debug_logs/ml_info.txt
fi

# Test Endpoints
echo "🧪 Testing Endpoints" > debug_logs/endpoint_tests.txt
echo "===================" >> debug_logs/endpoint_tests.txt

# Test backend health
echo "Backend Health Check:" >> debug_logs/endpoint_tests.txt
curl -s -w "\nStatus: %{http_code}\nTime: %{time_total}s\n" http://localhost:8080/health >> debug_logs/endpoint_tests.txt 2>&1 || echo "Backend not accessible" >> debug_logs/endpoint_tests.txt

# Test ML service
echo -e "\nML Service Test:" >> debug_logs/endpoint_tests.txt
curl -s -w "\nStatus: %{http_code}\nTime: %{time_total}s\n" -X POST http://localhost:8000/sentiment/analyze -H "Content-Type: application/json" -d '{"text":"चांगले","language":"mr"}' >> debug_logs/endpoint_tests.txt 2>&1 || echo "ML Service not accessible" >> debug_logs/endpoint_tests.txt

# Test frontend
echo -e "\nFrontend Test:" >> debug_logs/endpoint_tests.txt
curl -s -w "\nStatus: %{http_code}\nTime: %{time_total}s\n" http://localhost:3000 >> debug_logs/endpoint_tests.txt 2>&1 || echo "Frontend not accessible" >> debug_logs/endpoint_tests.txt

# Create Archive
echo "📦 Creating debug archive..."
tar -czf debug_logs_$(date +%Y%m%d_%H%M%S).tar.gz debug_logs/

echo "✅ Debug information collection complete!"
echo "📁 Debug logs saved in: debug_logs/"
echo "📦 Archive created: debug_logs_*.tar.gz"
echo ""
echo "📤 Please share the archive file when seeking support."