# Usa una imagen base de Playwright que ya incluye las dependencias necesarias para ejecutar los navegadores
FROM mcr.microsoft.com/playwright:focal

# Usa una imagen base que incluya Node.js
FROM node:18-slim

# Instalar dependencias adicionales para la interfaz gráfica y ejecución de navegadores
RUN apt-get update && apt-get install -y \
  wget \
  gnupg \
  ca-certificates \
  libnss3 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  libdbus-1-3 \
  libxtst6 \
  iputils-ping \
  --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

# Instalar Google Chrome (si deseas tenerlo en lugar de Chromium)
RUN wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install -y google-chrome-stable --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Crear directorios y establecer el directorio de trabajo
WORKDIR /app

# Copia el package.json y package-lock.json (o yarn.lock)
COPY package*.json ./

# Instalar las dependencias de la aplicación
RUN pnpm install

# Instalar Playwright y sus dependencias
RUN pnpm add playwright 
RUN npx playwright install --with-deps

# Copia el resto de la aplicación
COPY . .

# Expone el puerto donde corre la aplicación
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "src/app.js"]
