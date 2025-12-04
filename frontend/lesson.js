/*
 * ===== LESSON PAGE JAVASCRIPT =====
 * 
 * SETUP INSTRUCTIONS:
 * 1. Ensure this file is in the same folder as lesson.html
 * 2. Backend URL points to your existing Render backend
 * 3. URL params: ?module=<id>&lesson=<number>
 * 4. To test locally: Open lesson.html?module=python-basics&lesson=1
 * 5. To deploy: Copy to Firebase public folder and run 'firebase deploy --only hosting'
 * 
 * FEATURES:
 * - Load lesson content by module and lesson ID
 * - Ask AI Explainer (calls /ask endpoint)
 * - Generate Image (calls /image endpoint - placeholder)
 * - Navigate between lessons
 * - Mark lessons as completed
 * - Progress tracking with localStorage
 */

// ===== CONFIGURATION =====
const BACKEND_URL = 'https://ai-tutor-jarvis.onrender.com';

// ===== LESSON DATA =====
const lessonsData = {
    'python-basics': {
        title: 'Python Basics',
        lessons: [
            {
                id: 1,
                title: 'Introduction to Python',
                duration: '10 min',
                level: 'Beginner',
                content: `
# Welcome to Python Programming!

Python is a powerful, easy-to-learn programming language that's perfect for beginners and professionals alike.

## Why Learn Python?

- **Easy to Read**: Python code is clean and readable
- **Versatile**: Used in web development, data science, AI, automation
- **Large Community**: Tons of resources and libraries available
- **High Demand**: One of the most in-demand programming skills

## Your First Python Program

\`\`\`python
print("Hello, World!")
\`\`\`

This simple line of code outputs text to the console. Let's break it down:

- \`print()\` is a built-in function
- The text inside quotes is a **string**
- Strings can use single (' ') or double (" ") quotes

## Try It Yourself!

Experiment with different messages:

\`\`\`python
print("Welcome to JARVIS Learning!")
print('Python is awesome!')
\`\`\`

**Next Steps**: In the next lesson, we'll learn about variables and data types!
                `
            },
            {
                id: 2,
                title: 'Variables and Data Types',
                duration: '15 min',
                level: 'Beginner',
                content: `
# Variables and Data Types

Variables are containers for storing data values. In Python, you don't need to declare variable types explicitly.

## Creating Variables

\`\`\`python
name = "JARVIS"
age = 25
height = 5.9
is_student = True
\`\`\`

## Basic Data Types

### 1. Strings (str)
Text data enclosed in quotes:

\`\`\`python
message = "Hello, Python!"
course = 'Data Science'
\`\`\`

### 2. Integers (int)
Whole numbers without decimals:

\`\`\`python
score = 100
year = 2025
\`\`\`

### 3. Floats (float)
Numbers with decimal points:

\`\`\`python
price = 99.99
pi = 3.14159
\`\`\`

### 4. Booleans (bool)
True or False values:

\`\`\`python
is_active = True
has_completed = False
\`\`\`

## Type Checking

Use \`type()\` to check data types:

\`\`\`python
print(type(name))      # <class 'str'>
print(type(age))       # <class 'int'>
print(type(height))    # <class 'float'>
print(type(is_student)) # <class 'bool'>
\`\`\`

## Practice Exercise

Create variables for your personal information and print them!
                `
            },
            {
                id: 3,
                title: 'Operators and Expressions',
                duration: '12 min',
                level: 'Beginner',
                content: `
# Operators and Expressions

Operators are symbols that perform operations on variables and values.

## Arithmetic Operators

\`\`\`python
# Basic math operations
a = 10
b = 3

print(a + b)   # Addition: 13
print(a - b)   # Subtraction: 7
print(a * b)   # Multiplication: 30
print(a / b)   # Division: 3.333...
print(a // b)  # Floor Division: 3
print(a % b)   # Modulus (remainder): 1
print(a ** b)  # Exponent: 1000
\`\`\`

## Comparison Operators

\`\`\`python
x = 5
y = 10

print(x == y)  # Equal: False
print(x != y)  # Not equal: True
print(x < y)   # Less than: True
print(x > y)   # Greater than: False
print(x <= y)  # Less than or equal: True
print(x >= y)  # Greater than or equal: False
\`\`\`

## Logical Operators

\`\`\`python
age = 20
has_license = True

# AND operator
can_drive = age >= 18 and has_license
print(can_drive)  # True

# OR operator
is_eligible = age >= 18 or has_license
print(is_eligible)  # True

# NOT operator
is_minor = not (age >= 18)
print(is_minor)  # False
\`\`\`

Keep practicing these operators - they're fundamental to programming!
                `
            }
        ]
    },
    'java-basics': {
        title: 'Java Basics',
        lessons: [
            {
                id: 1,
                title: 'Introduction to Java',
                duration: '12 min',
                level: 'Beginner',
                content: `
# Welcome to Java Programming!

Java is a powerful, object-oriented programming language used worldwide for building robust applications.

## Why Learn Java?

- **Platform Independent**: "Write Once, Run Anywhere"
- **Object-Oriented**: Promotes clean, modular code
- **Industry Standard**: Used by major companies (Google, Amazon, Netflix)
- **Strong Typing**: Catches errors at compile-time

## Your First Java Program

\`\`\`java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

## Breaking It Down

- \`public class HelloWorld\`: Declares a public class
- \`main\` method: Entry point of the program
- \`System.out.println()\`: Prints text to console

## Key Concepts

1. **Class**: Blueprint for objects
2. **Method**: Function inside a class
3. **Statements**: End with semicolon (;)

**Next**: We'll explore variables and data types in Java!
                `
            }
        ]
    },
    'iot-fundamentals': {
        title: 'IoT Fundamentals',
        lessons: [
            {
                id: 1,
                title: 'Introduction to IoT',
                duration: '15 min',
                level: 'Intermediate',
                content: `
# Internet of Things (IoT)

IoT connects physical devices to the internet, enabling them to collect and share data.

## What is IoT?

The Internet of Things refers to billions of physical devices around the world that are connected to the internet, collecting and sharing data.

## IoT Examples

- 🏠 **Smart Homes**: Thermostats, lights, security systems
- 🏥 **Healthcare**: Wearable fitness trackers, remote monitoring
- 🏭 **Industrial**: Sensors, predictive maintenance
- 🚗 **Automotive**: Connected cars, GPS tracking

## IoT Architecture

1. **Sensors/Devices**: Collect data (temperature, motion, etc.)
2. **Connectivity**: Wi-Fi, Bluetooth, cellular networks
3. **Data Processing**: Cloud or edge computing
4. **User Interface**: Mobile apps, dashboards

## Common IoT Platforms

- Arduino
- Raspberry Pi
- ESP32/ESP8266
- AWS IoT
- Google Cloud IoT

## Getting Started

In this course, you'll learn to:
- Program microcontrollers
- Read sensor data
- Connect devices to the internet
- Build IoT applications

Let's start building smart devices! 🚀
                `
            }
        ]
    },
    'docker-basics': {
        title: 'Docker Basics',
        lessons: [
            {
                number: 1,
                title: 'Introduction to Docker',
                content: `
# Welcome to Docker!

## What is Docker?

Docker is a platform for developing, shipping, and running applications in **containers**. Containers package your application with all its dependencies, ensuring it runs consistently across different environments.

### Why Use Docker?

- ✅ **Consistency**: Works the same everywhere (dev, staging, production)
- ✅ **Isolation**: Apps run independently without conflicts
- ✅ **Efficiency**: Lightweight compared to virtual machines
- ✅ **Portability**: Build once, run anywhere
- ✅ **Scalability**: Easy to scale up/down

## Containers vs Virtual Machines

**Virtual Machines**:
- Run full operating system
- Heavy (GBs of disk space)
- Slow to start (minutes)
- High resource usage

**Containers**:
- Share host OS kernel
- Lightweight (MBs of disk space)
- Fast startup (seconds)
- Efficient resource usage

## Docker Components

1. **Docker Engine**: Core runtime that builds and runs containers
2. **Docker Hub**: Registry for sharing container images
3. **Dockerfile**: Blueprint for building images
4. **Docker Compose**: Tool for multi-container applications

## Real-World Use Cases

- 🌐 **Web Apps**: Deploy Node.js, Python, PHP apps
- 🗄️ **Databases**: Run MySQL, MongoDB, PostgreSQL
- 🤖 **Microservices**: Each service in own container
- 🧪 **Testing**: Create isolated test environments
- 📦 **CI/CD**: Build and deploy pipelines

## What You'll Learn

By the end of this course:
1. ✅ Install and configure Docker
2. ✅ Create and manage containers
3. ✅ Build custom Docker images
4. ✅ Use Docker Compose for multi-container apps
5. ✅ Deploy applications with Docker

Let's containerize! 🐳
                `
            },
            {
                number: 2,
                title: 'Installing Docker',
                content: `
# Installing Docker

## System Requirements

- **Windows**: Windows 10/11 Pro, Enterprise, or Education (64-bit)
- **Mac**: macOS 10.15 or newer
- **Linux**: Most modern distributions

## Installation Steps

### For Windows:

1. **Download Docker Desktop**
   - Visit: [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
   - Download for Windows

2. **Install Docker Desktop**
   - Run the installer
   - Enable WSL 2 (Windows Subsystem for Linux)
   - Restart computer

3. **Verify Installation**
\`\`\`powershell
docker --version
# Output: Docker version 24.0.6

docker run hello-world
\`\`\`

### For Mac:

1. **Download Docker Desktop**
   - Visit: [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
   - Choose Intel or Apple Silicon version

2. **Install**
   - Drag Docker.app to Applications
   - Launch Docker Desktop
   - Follow setup wizard

3. **Verify**
\`\`\`bash
docker --version
docker run hello-world
\`\`\`

### For Linux (Ubuntu/Debian):

\`\`\`bash
# Update packages
sudo apt update

# Install dependencies
sudo apt install apt-transport-https ca-certificates curl software-properties-common

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

# Add user to docker group
sudo usermod -aG docker $USER

# Verify
docker --version
docker run hello-world
\`\`\`

## Docker Desktop Interface

After installation, Docker Desktop provides:
- 📊 **Dashboard**: View running containers
- 🖼️ **Images**: Manage downloaded images
- 📦 **Volumes**: Persistent data storage
- 🔧 **Settings**: Configure Docker preferences

## First Container

Let's run your first container:

\`\`\`bash
docker run -d -p 80:80 nginx
\`\`\`

- \`-d\`: Run in detached mode (background)
- \`-p 80:80\`: Map port 80 (host) to 80 (container)
- \`nginx\`: Image name

Visit: **http://localhost** to see Nginx running!

## Basic Commands

\`\`\`bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop a container
docker stop <container-id>

# Remove a container
docker rm <container-id>

# List downloaded images
docker images
\`\`\`

You're now ready to work with Docker! 🚀
                `
            },
            {
                number: 3,
                title: 'Docker Images and Containers',
                content: `
# Docker Images and Containers

## Understanding Images

A **Docker image** is a read-only template containing:
- Application code
- Runtime environment
- System libraries
- Dependencies
- Configuration files

Think of it as a **snapshot** or **blueprint** for creating containers.

## Image Layers

Images are built in layers:

\`\`\`
Layer 5: Your application code
Layer 4: Application dependencies
Layer 3: Runtime (Node.js, Python, etc.)
Layer 2: Operating system libraries
Layer 1: Base OS (Ubuntu, Alpine, etc.)
\`\`\`

**Benefits**:
- 🔄 Reusable layers (saves space)
- ⚡ Fast builds (only changed layers rebuild)
- 📦 Efficient storage

## Working with Images

### Pull an Image from Docker Hub

\`\`\`bash
# Pull latest version
docker pull ubuntu

# Pull specific version
docker pull ubuntu:20.04

# Pull different image
docker pull node:18-alpine
\`\`\`

### List Images

\`\`\`bash
docker images

# Output:
# REPOSITORY   TAG       IMAGE ID       CREATED        SIZE
# ubuntu       latest    54c9d81cbb44   2 weeks ago    72.8MB
# node         18-alpine a1b2c3d4e5f6   1 month ago    170MB
\`\`\`

### Remove Images

\`\`\`bash
# Remove by name
docker rmi ubuntu:20.04

# Remove by ID
docker rmi a1b2c3d4e5f6

# Remove unused images
docker image prune
\`\`\`

## Understanding Containers

A **container** is a running instance of an image.

**Image vs Container**:
- **Image**: Static blueprint (like a class in OOP)
- **Container**: Running instance (like an object)

## Creating Containers

### Basic Container

\`\`\`bash
# Run Ubuntu container
docker run ubuntu echo "Hello Docker!"
\`\`\`

This:
1. Downloads ubuntu image (if not exists)
2. Creates container
3. Runs command
4. Stops and exits

### Interactive Container

\`\`\`bash
# Run with interactive terminal
docker run -it ubuntu bash

# Now you're inside the container!
root@abc123:/# ls
root@abc123:/# pwd
root@abc123:/# exit
\`\`\`

- \`-i\`: Interactive (keep STDIN open)
- \`-t\`: Allocate pseudo-TTY (terminal)

### Named Container

\`\`\`bash
# Give container a name
docker run --name my-ubuntu -it ubuntu bash
\`\`\`

### Background Container

\`\`\`bash
# Run Nginx in background
docker run -d --name web-server -p 8080:80 nginx
\`\`\`

## Container Lifecycle

\`\`\`bash
# Start stopped container
docker start web-server

# Stop running container
docker stop web-server

# Restart container
docker restart web-server

# Pause container
docker pause web-server

# Unpause container
docker unpause web-server

# Remove container
docker rm web-server

# Remove running container (force)
docker rm -f web-server
\`\`\`

## Inspecting Containers

\`\`\`bash
# View container logs
docker logs web-server

# Follow logs (live)
docker logs -f web-server

# View container details
docker inspect web-server

# View resource usage
docker stats web-server

# Execute command in running container
docker exec -it web-server bash
\`\`\`

## Practical Example: Node.js App

\`\`\`bash
# Run Node.js container
docker run -d --name my-node-app -p 3000:3000 -v $(pwd):/app -w /app node:18 node server.js
\`\`\`

- \`-p 3000:3000\`: Map port 3000
- \`-v $(pwd):/app\`: Mount current directory
- \`-w /app\`: Set working directory
- \`node server.js\`: Run command

Next: We'll build our own custom images! 🏗️
                `
            },
            {
                number: 4,
                title: 'Creating Dockerfiles',
                content: `
# Creating Dockerfiles

## What is a Dockerfile?

A **Dockerfile** is a text file with instructions to build a Docker image.

## Dockerfile Instructions

### FROM - Base Image

\`\`\`dockerfile
FROM node:18-alpine
\`\`\`

Specifies the base image to build upon.

### WORKDIR - Working Directory

\`\`\`dockerfile
WORKDIR /app
\`\`\`

Sets the working directory inside container.

### COPY - Copy Files

\`\`\`dockerfile
COPY package.json .
COPY src/ ./src/
\`\`\`

Copies files from host to container.

### RUN - Execute Commands

\`\`\`dockerfile
RUN npm install
RUN apt-get update && apt-get install -y curl
\`\`\`

Executes commands during image build.

### ENV - Environment Variables

\`\`\`dockerfile
ENV NODE_ENV=production
ENV PORT=3000
\`\`\`

Sets environment variables.

### EXPOSE - Port Declaration

\`\`\`dockerfile
EXPOSE 3000
\`\`\`

Documents which port app listens on.

### CMD - Default Command

\`\`\`dockerfile
CMD ["node", "server.js"]
\`\`\`

Command to run when container starts.

## Complete Example: Node.js App

**Dockerfile**:

\`\`\`dockerfile
# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]
\`\`\`

**Build Image**:

\`\`\`bash
docker build -t my-node-app .
\`\`\`

- \`-t\`: Tag/name the image
- \`.\`: Build context (current directory)

**Run Container**:

\`\`\`bash
docker run -d -p 3000:3000 my-node-app
\`\`\`

## Multi-Stage Builds

Optimize image size with multi-stage builds:

\`\`\`dockerfile
# Stage 1: Build
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --production
CMD ["node", "dist/server.js"]
\`\`\`

**Benefits**:
- Smaller final image
- No build tools in production
- Faster deployments

## Best Practices

### 1. Use .dockerignore

Create \`.dockerignore\`:

\`\`\`
node_modules
npm-debug.log
.git
.env
*.md
\`\`\`

### 2. Minimize Layers

**Bad**:
\`\`\`dockerfile
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y git
\`\`\`

**Good**:
\`\`\`dockerfile
RUN apt-get update && apt-get install -y \\
    curl \\
    git
\`\`\`

### 3. Order Matters

Put frequently changing instructions last:

\`\`\`dockerfile
# Rarely changes
FROM node:18-alpine
WORKDIR /app

# Changes occasionally
COPY package*.json ./
RUN npm install

# Changes frequently
COPY . .
\`\`\`

### 4. Use Specific Tags

**Bad**: \`FROM node\` (uses latest, unpredictable)
**Good**: \`FROM node:18-alpine\` (specific version)

## Example: Python Flask App

\`\`\`dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["flask", "run", "--host=0.0.0.0"]
\`\`\`

Next: Docker Compose for multi-container apps! 🐳
                `
            },
            {
                number: 5,
                title: 'Docker Compose',
                content: `
# Docker Compose

## What is Docker Compose?

Docker Compose is a tool for defining and running multi-container applications using a YAML file.

## Why Use Docker Compose?

- 🎯 **Simple**: Define entire stack in one file
- 🔄 **Reproducible**: Same environment every time
- 🚀 **Fast**: Start all services with one command
- 📦 **Organized**: Manage related containers together

## docker-compose.yml Structure

\`\`\`yaml
version: '3.8'

services:
  service-name:
    image: image-name
    ports:
      - "host:container"
    environment:
      - KEY=value
    volumes:
      - host-path:container-path
\`\`\`

## Example: Web App + Database

**docker-compose.yml**:

\`\`\`yaml
version: '3.8'

services:
  # Node.js Application
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=myapp
    depends_on:
      - db
    volumes:
      - ./src:/app/src

  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=myapp
    volumes:
      - db-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  db-data:
\`\`\`

## Docker Compose Commands

\`\`\`bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs

# Follow logs
docker-compose logs -f

# List services
docker-compose ps

# Rebuild images
docker-compose build

# Stop and remove everything (including volumes)
docker-compose down -v
\`\`\`

## Real-World Example: MERN Stack

\`\`\`yaml
version: '3.8'

services:
  # MongoDB
  mongo:
    image: mongo:7
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"

  # Express API
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://admin:password@mongo:27017
      - JWT_SECRET=mysecret
    depends_on:
      - mongo
    volumes:
      - ./backend:/app
      - /app/node_modules

  # React Frontend
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  mongo-data:
\`\`\`

## Advanced Features

### Networks

\`\`\`yaml
services:
  app:
    networks:
      - frontend
      - backend

  db:
    networks:
      - backend

networks:
  frontend:
  backend:
\`\`\`

### Health Checks

\`\`\`yaml
services:
  db:
    image: postgres:15
    healthcheck:
      test: ["CMD", "pg_isready"]
      interval: 10s
      timeout: 5s
      retries: 5
\`\`\`

### Environment Files

**.env**:
\`\`\`
DB_USER=admin
DB_PASS=secret
\`\`\`

**docker-compose.yml**:
\`\`\`yaml
services:
  app:
    env_file:
      - .env
\`\`\`

## Development vs Production

**docker-compose.dev.yml**:
\`\`\`yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - ./src:/app/src  # Hot reload
\`\`\`

**docker-compose.prod.yml**:
\`\`\`yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    restart: always
\`\`\`

**Usage**:
\`\`\`bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

Next: Deploying Docker containers to production! 🚀
                `
            },
            {
                number: 6,
                title: 'Docker Best Practices & Deployment',
                content: `
# Docker Best Practices & Deployment

## Security Best Practices

### 1. Don't Run as Root

**Bad**:
\`\`\`dockerfile
FROM node:18
WORKDIR /app
COPY . .
CMD ["node", "server.js"]
\`\`\`

**Good**:
\`\`\`dockerfile
FROM node:18
WORKDIR /app
COPY . .
USER node
CMD ["node", "server.js"]
\`\`\`

### 2. Use Official Images

✅ \`FROM node:18-alpine\`
❌ \`FROM some-random-image\`

### 3. Scan for Vulnerabilities

\`\`\`bash
docker scan my-image:latest
\`\`\`

### 4. Keep Images Updated

\`\`\`bash
# Update base images regularly
docker pull node:18-alpine
docker build -t my-app .
\`\`\`

### 5. Use Secrets Management

**Bad**: \`ENV DB_PASSWORD=secret123\`

**Good**: Use Docker secrets or environment variables at runtime:
\`\`\`bash
docker run -e DB_PASSWORD=$(cat secret.txt) my-app
\`\`\`

## Performance Optimization

### 1. Multi-Stage Builds

Reduces image size by 70%+:

\`\`\`dockerfile
# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
COPY --from=builder /app/dist .
CMD ["node", "dist/server.js"]
\`\`\`

### 2. Layer Caching

Order instructions by frequency of change:

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app

# Dependencies (changes rarely)
COPY package*.json ./
RUN npm install

# Source code (changes often)
COPY . .
\`\`\`

### 3. Use .dockerignore

\`\`\`
node_modules
.git
.env
*.log
.DS_Store
README.md
\`\`\`

### 4. Minimize Image Size

- Use Alpine images: \`node:18-alpine\` instead of \`node:18\`
- Remove unnecessary files: \`RUN rm -rf /tmp/*\`
- Clean package manager cache: \`RUN npm ci --production && npm cache clean --force\`

## Deployment Strategies

### 1. Docker Hub

**Push Image**:
\`\`\`bash
# Tag image
docker tag my-app username/my-app:latest

# Login
docker login

# Push
docker push username/my-app:latest
\`\`\`

**Pull and Run**:
\`\`\`bash
docker pull username/my-app:latest
docker run -d -p 80:3000 username/my-app:latest
\`\`\`

### 2. Deploy to Cloud

#### **AWS ECS (Elastic Container Service)**

\`\`\`bash
# Install AWS CLI
aws configure

# Create task definition
aws ecs register-task-definition --cli-input-json file://task-def.json

# Create service
aws ecs create-service --cluster my-cluster --service-name my-app
\`\`\`

#### **Azure Container Instances**

\`\`\`bash
# Login
az login

# Create container
az container create \\
  --resource-group myResourceGroup \\
  --name mycontainer \\
  --image username/my-app:latest \\
  --ports 80
\`\`\`

#### **Google Cloud Run**

\`\`\`bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT-ID/my-app

# Deploy
gcloud run deploy --image gcr.io/PROJECT-ID/my-app
\`\`\`

### 3. Kubernetes

**deployment.yaml**:
\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: username/my-app:latest
        ports:
        - containerPort: 3000
\`\`\`

\`\`\`bash
kubectl apply -f deployment.yaml
\`\`\`

## Monitoring & Logging

### View Container Logs

\`\`\`bash
# View logs
docker logs my-container

# Follow logs
docker logs -f my-container

# Last 100 lines
docker logs --tail 100 my-container
\`\`\`

### Monitor Resources

\`\`\`bash
# Real-time stats
docker stats

# Inspect container
docker inspect my-container
\`\`\`

### Logging Drivers

**docker-compose.yml**:
\`\`\`yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
\`\`\`

## Backup & Recovery

### Backup Volumes

\`\`\`bash
# Backup volume
docker run --rm --volumes-from my-container -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data

# Restore volume
docker run --rm --volumes-from my-container -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /
\`\`\`

### Export/Import Containers

\`\`\`bash
# Export container
docker export my-container > container.tar

# Import container
docker import container.tar my-image:latest
\`\`\`

## Troubleshooting

### Container Won't Start

\`\`\`bash
# Check logs
docker logs my-container

# Run in interactive mode
docker run -it my-image sh

# Check container status
docker ps -a
\`\`\`

### Port Already in Use

\`\`\`bash
# Find process using port
netstat -ano | findstr :3000

# Kill process
taskkill /PID <pid> /F

# Or use different port
docker run -p 3001:3000 my-app
\`\`\`

### Out of Disk Space

\`\`\`bash
# Clean up
docker system prune -a

# Remove unused volumes
docker volume prune

# Remove unused images
docker image prune -a
\`\`\`

## Congratulations! 🎉

You now know:
✅ What Docker is and why it's useful
✅ How to install and configure Docker
✅ Creating and managing containers
✅ Building custom images with Dockerfiles
✅ Using Docker Compose for multi-container apps
✅ Best practices for security and performance
✅ Deploying containers to production

**Keep Learning**:
- Explore Kubernetes
- Learn Docker Swarm
- Study microservices architecture
- Practice CI/CD with Docker

You're now a Docker expert! 🐳🚀
                `
            }
        ]
    }
};

// ===== STATE =====
let currentModule = '';
let currentLesson = 1;
let completedLessons = JSON.parse(localStorage.getItem('completedLessons')) || {};

// ===== DOM ELEMENTS =====
const moduleTitle = document.getElementById('moduleTitle');
const lessonList = document.getElementById('lessonList');
const lessonTitle = document.getElementById('lessonTitle');
const lessonBody = document.getElementById('lessonBody');
const lessonDuration = document.getElementById('lessonDuration');
const lessonLevel = document.getElementById('lessonLevel');
const breadcrumbModule = document.getElementById('breadcrumbModule');
const breadcrumbLesson = document.getElementById('breadcrumbLesson');
const explainBtn = document.getElementById('explainBtn');
const imageBtn = document.getElementById('imageBtn');
const quizBtn = document.getElementById('quizBtn');
const completeBtn = document.getElementById('completeBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const aiResponseBox = document.getElementById('aiResponseBox');
const aiResponseContent = document.getElementById('aiResponseContent');
const closeResponse = document.getElementById('closeResponse');
const sidebar = document.getElementById('lessonSidebar');
const mobileSidebarBtn = document.getElementById('mobileSidebarBtn');
const sidebarToggle = document.getElementById('sidebarToggle');

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('📖 Lesson page loaded');
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    currentModule = urlParams.get('module') || 'python-basics';
    currentLesson = parseInt(urlParams.get('lesson')) || 1;
    
    loadLesson();
    setupEventListeners();
});

// ===== LOAD LESSON =====
function loadLesson() {
    const moduleData = lessonsData[currentModule];
    
    if (!moduleData) {
        lessonBody.innerHTML = '<p style="color: red;">Module not found. <a href="courses.html">Return to courses</a></p>';
        return;
    }
    
    const lesson = moduleData.lessons.find(l => l.id === currentLesson);
    
    if (!lesson) {
        lessonBody.innerHTML = '<p style="color: red;">Lesson not found.</p>';
        return;
    }
    
    // Update UI
    moduleTitle.textContent = moduleData.title;
    lessonTitle.textContent = lesson.title;
    lessonDuration.textContent = lesson.duration;
    lessonLevel.textContent = lesson.level;
    breadcrumbModule.textContent = moduleData.title;
    breadcrumbLesson.textContent = lesson.title;
    
    // Render markdown content
    lessonBody.innerHTML = marked.parse(lesson.content);
    
    // Highlight code blocks
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
    
    // Update sidebar
    renderLessonList(moduleData);
    
    // Update navigation buttons
    prevBtn.disabled = currentLesson === 1;
    nextBtn.disabled = currentLesson === moduleData.lessons.length;
    
    // Update complete button
    updateCompleteButton();
    
    console.log(`✅ Loaded: ${moduleData.title} - Lesson ${currentLesson}`);
}

// ===== RENDER LESSON LIST =====
function renderLessonList(moduleData) {
    lessonList.innerHTML = moduleData.lessons.map(lesson => {
        const isActive = lesson.id === currentLesson;
        const isCompleted = isLessonCompleted(currentModule, lesson.id);
        
        return `
            <li class="${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" 
                onclick="navigateToLesson(${lesson.id})">
                <i class="fas ${isCompleted ? 'fa-check-circle' : 'fa-circle'}"></i>
                <span>Lesson ${lesson.id}: ${lesson.title}</span>
            </li>
        `;
    }).join('');
}

// ===== NAVIGATION =====
function navigateToLesson(lessonId) {
    window.location.href = `lesson.html?module=${currentModule}&lesson=${lessonId}`;
}

function goToPrevLesson() {
    if (currentLesson > 1) {
        navigateToLesson(currentLesson - 1);
    }
}

function goToNextLesson() {
    const moduleData = lessonsData[currentModule];
    if (currentLesson < moduleData.lessons.length) {
        navigateToLesson(currentLesson + 1);
    }
}

// ===== AI EXPLAINER =====
async function askAIExplainer() {
    const lesson = lessonsData[currentModule].lessons.find(l => l.id === currentLesson);
    
    explainBtn.disabled = true;
    explainBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Asking AI...';
    
    try {
        const response = await fetch(`${BACKEND_URL}/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: `Explain this lesson in simple terms: ${lesson.title}. Topic: ${lesson.content.substring(0, 200)}`,
                history: [],
                mode: 'tutor',
                systemPrompt: 'You are JARVIS, an expert tutor. Explain concepts clearly and simply.'
            })
        });
        
        const data = await response.json();
        
        // Show response
        aiResponseContent.innerHTML = marked.parse(data.answer || 'No response received.');
        aiResponseBox.style.display = 'block';
        
        console.log('✅ AI Explainer response received');
    } catch (error) {
        console.error('❌ AI Explainer error:', error);
        aiResponseContent.innerHTML = '<p style="color: red;">Error connecting to AI. Please check if backend is running.</p>';
        aiResponseBox.style.display = 'block';
    } finally {
        explainBtn.disabled = false;
        explainBtn.innerHTML = '<i class="fas fa-lightbulb"></i> Ask AI Explainer';
    }
}

// ===== GENERATE IMAGE (Placeholder) =====
async function generateImage() {
    const lesson = lessonsData[currentModule].lessons.find(l => l.id === currentLesson);
    
    imageBtn.disabled = true;
    imageBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    
    // Placeholder: In production, call /image endpoint
    // For now, show a message
    setTimeout(() => {
        alert(`Image generation feature coming soon!\n\nLesson: ${lesson.title}\n\nThis will call your backend /image endpoint to generate relevant illustrations.`);
        imageBtn.disabled = false;
        imageBtn.innerHTML = '<i class="fas fa-image"></i> Generate Image';
    }, 1000);
}

// ===== TAKE QUIZ =====
function takeQuiz() {
    window.location.href = `quiz.html?module=${currentModule}&lesson=${currentLesson}`;
}

// ===== MARK COMPLETED =====
function markCompleted() {
    if (!completedLessons[currentModule]) {
        completedLessons[currentModule] = [];
    }
    
    if (!completedLessons[currentModule].includes(currentLesson)) {
        completedLessons[currentModule].push(currentLesson);
        localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
        
        // Update UI
        updateCompleteButton();
        renderLessonList(lessonsData[currentModule]);
        
        // Update course progress
        updateCourseProgress();
        
        alert('✅ Lesson marked as completed! Great job!');
        console.log('✅ Lesson completed:', currentModule, currentLesson);
    }
}

// ===== UPDATE COMPLETE BUTTON =====
function updateCompleteButton() {
    if (isLessonCompleted(currentModule, currentLesson)) {
        completeBtn.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
        completeBtn.style.opacity = '0.6';
    } else {
        completeBtn.innerHTML = '<i class="fas fa-check"></i> Mark Completed';
        completeBtn.style.opacity = '1';
    }
}

// ===== CHECK IF LESSON COMPLETED =====
function isLessonCompleted(module, lessonId) {
    return completedLessons[module]?.includes(lessonId) || false;
}

// ===== UPDATE COURSE PROGRESS =====
function updateCourseProgress() {
    const progress = JSON.parse(localStorage.getItem('courseProgress')) || {};
    progress[currentModule] = completedLessons[currentModule] || [];
    localStorage.setItem('courseProgress', JSON.stringify(progress));
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
    prevBtn.addEventListener('click', goToPrevLesson);
    nextBtn.addEventListener('click', goToNextLesson);
    explainBtn.addEventListener('click', askAIExplainer);
    imageBtn.addEventListener('click', generateImage);
    quizBtn.addEventListener('click', takeQuiz);
    completeBtn.addEventListener('click', markCompleted);
    closeResponse.addEventListener('click', () => {
        aiResponseBox.style.display = 'none';
    });
    
    // Mobile sidebar toggle
    mobileSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
    
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });
}

// ===== EXPOSE FUNCTIONS TO GLOBAL SCOPE =====
window.navigateToLesson = navigateToLesson;

console.log('✅ Lesson JavaScript loaded successfully');
