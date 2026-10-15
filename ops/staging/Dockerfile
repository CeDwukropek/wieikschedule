FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
COPY scripts ./scripts
RUN npm ci --no-audit --no-fund
COPY src ./src
COPY public ./public
COPY api ./api
COPY tailwind.config.js jsconfig.json ./
COPY ops/staging/build.cjs ops/staging/server.cjs ./ops/staging/
ARG CLIENT_CONFIG_HASH
RUN --mount=type=secret,id=client_env,target=/tmp/client.env node ops/staging/build.cjs
ENV NODE_ENV=production
USER node
EXPOSE 3100
CMD ["node", "ops/staging/server.cjs"]
