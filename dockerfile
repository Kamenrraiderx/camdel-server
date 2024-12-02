FROM mcr.microsoft.com/playwright:focal
# Usa una imagen base que incluya Node.js
FROM node:18-slim

# Instala las dependencias necesarias para Puppeteer y Chromium
RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*
  
RUN apt-get update && apt-get install -y iputils-ping

# Instalar pnpm globalmente
RUN npm install -g pnpm
# Crear directorios y establecer el directorio de trabajo
WORKDIR /app


# Copia el package.json y package-lock.json (o yarn.lock)
COPY package*.json ./

# Instalar las dependencias de la aplicación
RUN pnpm install


RUN pnpm add playwright 
RUN npx playwright install --with-deps
# Copia el resto de la aplicación
COPY . .

# Expone el puerto donde corre la aplicación
EXPOSE 3000



# Comando para ejecutar la aplicación
CMD ["node", "src/app.js"]