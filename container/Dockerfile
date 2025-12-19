# see docker-bake.hcl for definition of nodejs_lts context

# Install npm dependencies
FROM nodejs_lts AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Build nextjs app using dependencies above
FROM nodejs_lts AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Build the actual container
FROM nodejs_lts AS runner

# Create a non-root user to own the process
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy files from builders
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node","server.js"]

