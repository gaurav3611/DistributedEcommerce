# 🛒 Distributed E-Commerce Platform

A highly scalable, distributed e-commerce platform built on a microservices-ready architecture using cutting-edge Big Data distributed computing technologies. 

This platform leverages **Apache Ignite** for in-memory distributed database capabilities, **Hadoop HDFS** for distributed massive-scale file/transaction storage, and **Apache ZooKeeper** for real-time node coordination and service discovery.

---

## 🛠️ Architecture & Tech Stack

### Backend Stack
* **Framework:** Spring Boot & Java
* **Distributed Database / Cache:** Apache Ignite (In-Memory Data Fabric)
* **Distributed File System:** Apache Hadoop HDFS
* **Service Coordination:** Apache ZooKeeper & Curator
* **Build Tool:** Maven

### Frontend Stack
* **Framework:** React 19
* **Build Tool:** Vite
* **Styling:** Tailwind CSS & PostCSS
* **Features:** Responsive Design, Multi-step checkout, JWT Authentication flows

---

## 📋 Prerequisites
Before you clone and run this project, ensure you have the following installed on your machine:

- **Java 11 or higher** (`java -version`)
- **Maven** (`mvn -v`)
- **Node.js & npm** (`node -v`)
- **Apache Hadoop** (Single-node or Multi-node cluster)
- **Apache ZooKeeper** (`zkServer`)
- *(Optional)* GUI Tools like **PrettyZoo** or **ZooNavigator**

---

## 🚀 Installation & Local Development Guide

Follow these exact steps to start the application successfully:

### 1. Start the Distributed Infrastructure
The backend depends heavily on ZooKeeper and Hadoop. These **must** be running before starting the Spring server.

**Start ZooKeeper:**
```bash
zkServer start
# Or if installed via Homebrew: brew services start zookeeper
```

**Start Hadoop HDFS:**
```bash
# Important: If this is your first time ever running Hadoop, format the namenode first:
# hdfs namenode -format

# Start the distributed file system
start-dfs.sh
```

---

### 2. Start the Spring Boot Backend

Open a terminal in the root of the project to build and start the Java server.

```bash
# Clean, compile, and run the server
mvn clean install -DskipTests
mvn spring-boot:run
```
*The backend will automatically register itself with ZooKeeper and establish connections with Hadoop HDFS and Apache Ignite nodes.*

---

### 3. Start the React Frontend

Open a **new, second terminal window** and navigate into the `frontend` folder:

```bash
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
*The frontend will be available at [http://localhost:5173](http://localhost:5173).*

---

## 🛑 Shutting Down Safely
To prevent data corruption, gracefully shut down your cluster when you're finished:

1. Use `Ctrl + C` in the terminals running Spring Boot and Vite.
2. Stop Hadoop: `stop-dfs.sh`
3. Stop ZooKeeper: `zkServer stop`

---

## 🤝 Contributing
Feel free to fork this project, submit issues, or create pull requests. Because this is a distributed system, ensure any feature additions maintain fault-tolerance and handle node unavailability gracefully!
