# 🚀 IgniteCommerce: Distributed Enterprise Platform

Welcome to the full documentation for **IgniteCommerce** (also known in your codebase as `Ecomm-Distributed`), a highly scalable, distributed e-commerce platform built to solve enterprise-level data and traffic challenges.

---

## 🛠️ Technology Stack & Architecture

Unlike traditional monolith web apps, IgniteCommerce is explicitly designed to be split across hundreds of servers if necessary. It relies heavily on Apache Foundation big-data tools.

### 1. The Presentation Layer (Frontend)
*   **Framework**: React.js paired with Vite for lightning-fast module replacement.
*   **Design System**: **"Ignite Onyx"**. We completely removed standard light modes in favor of a premium, glassmorphic dark-mode interface `#0e0e0e`. Accents use a vibrant luminous coral/red (`#ff8e80`), paired with high-end typography (`Plus Jakarta Sans` & `Manrope`).
*   **Key UI Components**: Interactive storefront grid with hover heuristics, a centralized `CartSidebar`, multi-step checkout workflow, and a dedicated admin console.

### 2. The Application Layer (Backend)
*   **Framework**: Java 11 & **Spring Boot** (v2.7.18).
*   **Functionality**: It acts as the routing brain. It handles incoming requests for product inventories, manages user checkout lifecycles, and interacts securely with the deeper big-data services.

### 3. The Distributed Storage (Hadoop HDFS)
*   Instead of exclusively using a relational database (like MySQL or Postgres), the backend is directly wired into an **Apache Hadoop HDFS** node (`hdfs://localhost:9000`).
*   **Purpose**: Massive amounts of e-commerce payload data (immutable order ledgers, user analytics) are stored exactly like a decentralized file-system.

### 4. The Central Nervous System (Apache ZooKeeper)
*   **Framework**: **Apache ZooKeeper** (v3.8.3).
*   **Purpose**: Running multiple backend servers creates absolute chaos without a manager. ZooKeeper runs silently in the background (typically on port `2181`) acting as an omniscient cluster coordinator.
*   **Implementation**: We built `ZooKeeperService.java` to manage **Ephemeral Nodes**. Whenever a new Spring Boot backend server is turned on, it instantly establishes a TCP connection to ZooKeeper and creates a child node under `/ecomm-distributed` (e.g. `/node-a1b2c`). The moment the server's power cable is pulled, ZooKeeper instantly deletes the node, automatically notifying the rest of the application that the server is officially dead.

---

## 🏗️ Core Features Built So Far

1.  **Premium UX Redesign**: Rebuilt the aesthetics using Stitch MCP-generated UI modules. Fixed external media rendering via `no-referrer` CORS patches.
2.  **Distributed Session Nodes**: Backend instances now announce their heartbeat to ZooKeeper natively.
3.  **Role-Based Dashboards**: Built separation of concern between standard customers browsing the Active Search space and Admins who require access to verify payments.
4.  **Manual UTR Processing**: A specialized Checkout & Admin pipeline where high-value offline payments (like UPI) require the user to submit a UTR transaction number which an Admin must manually verify.

---

## 🚦 How to Run the Ecosystem

Because it is a distributed architecture, turning it on requires a specific boot sequence:

**1. Start the Coordinators & Storage**
```bash
# Start your local Hadoop cluster
start-dfs.sh

# Start ZooKeeper 
brew services start zookeeper  
# OR using docker: docker run -d -p 2181:2181 zookeeper
```

**2. Start the Backend API (Spring Boot)**
```bash
cd ~/Ecomm-Distributed
mvn spring-boot:run
```
*(Pro-tip: If you want to simulate 5 servers running at once to watch ZooKeeper orchestrate them, just open 5 terminal windows and run `mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=808X`, increasing the port number each time).*

**3. Start the Frontend (Vite/React)**
```bash
cd ~/Ecomm-Distributed/frontend
npm run dev
```

**4. Monitoring Systems**
*   **Storefront UI**: `http://localhost:5173`
*   **Backend Output**: `http://localhost:8081` 
*   **Hadoop Dashboard**: `http://localhost:9870`
*   **ZooKeeper Manager**: `http://localhost:9000` (If you deployed the ZooNavigator docker container)
