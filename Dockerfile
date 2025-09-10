# MIT License
# Autor atual: Cascade
# Data: 10-09-2025
# Descrição: Dockerfile para ambiente Node do projeto Abrigo de Animais (execução e testes)

# Imagem base leve do Node
FROM node:20-alpine

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas os manifests primeiro para otimizar cache
COPY package*.json ./

# Instala dependências (preferencialmente com ci, cai para install se não houver lock)
RUN npm ci || npm install

# Copia o restante do código
COPY . .

# Diretório que pode ser gerado pelos testes
RUN mkdir -p coverage

# Comando padrão executa os testes
CMD ["npm", "test"]
