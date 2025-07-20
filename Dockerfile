FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app ./

# Set environment variables
ENV NODE_ENV=production

# Expose the port your app runs on
EXPOSE 3000

# Start the server
CMD [ "node", "server.js" ]