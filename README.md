# 🛒 Distributed E-Commerce Platform

A highly scalable, distributed e-commerce platform built on a microservices-ready architecture using cutting-edge Big Data distributed computing technologies. 

This platform leverages **Apache Hadoop HDFS** for distributed file storage with automatic replication across multiple physical systems, **Apache ZooKeeper** for real-time node coordination and service discovery, and includes a **live Cluster Dashboard** to monitor distributed storage in real-time.

---

## 🛠️ Architecture & Tech Stack

### Backend Stack
* **Framework:** Spring Boot & Java
* **Distributed File System:** Apache Hadoop HDFS (Multi-Node Cluster)
* **Service Coordination:** Apache ZooKeeper
* **Cluster Monitoring:** Custom ClusterMonitorService (real-time DataNode, replication & file-block tracking)
* **Build Tool:** Maven

### Frontend Stack
* **Framework:** React 19
* **Build Tool:** Vite
* **Styling:** Tailwind CSS & PostCSS
* **Features:** Responsive Design, Multi-step checkout, Admin Panel, **Live Cluster Dashboard**

### How Distributed Storage Works
```
┌─────────────────────────────────────────────────────────────┐
│                      HDFS NameNode                          │
│              (Tracks where all files are)                   │
│                   Runs on System A                          │
└──────────────┬───────────────────────┬──────────────────────┘
               │                       │
        ┌──────▼──────┐         ┌──────▼──────┐
        │  DataNode A │         │  DataNode B │
        │  (System A) │         │  (System B) │
        │             │         │             │
        │ products/   │         │ products/   │  ← Same data
        │ users/      │         │ users/      │  ← replicated
        │ orders/     │         │ orders/     │  ← on BOTH!
        └─────────────┘         └─────────────┘
```
Every file is automatically replicated across all DataNodes. If one system goes down, **zero data is lost**.

---

## 📋 Prerequisites

### For Single System (Development)
- **Java 11 or higher** (`java -version`)
- **Maven** (`mvn -v`)
- **Node.js & npm** (`node -v`)
- **Apache Hadoop 3.3.x** (`hadoop version`)
- **Apache ZooKeeper** (`zkServer`)

### For Multi-System Distributed Setup (see Section below)
- All of the above on **every system**
- All systems on the **same WiFi / LAN network**
- **Windows users**: `winutils.exe` for Hadoop (see instructions below)

---

## 🚀 Quick Start (Single System)

### 1. Start the Infrastructure
```bash
# Start ZooKeeper
zkServer start

# Start Hadoop HDFS (format only on first run)
# hdfs namenode -format
start-dfs.sh
```

### 2. Start the Backend
```bash
mvn clean install -DskipTests
mvn spring-boot:run
```
The backend starts at `http://localhost:8081`

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend starts at `http://localhost:5173`

---

## 🌐 Multi-System Distributed Setup (The Main Feature!)

This section explains how to connect **2 or more physical computers** so they share storage via Hadoop HDFS. Every product, user, order, and cart is automatically replicated across all systems.

### Network Terminology
| Term | Meaning |
|---|---|
| **System A** | The "main" computer — runs NameNode + DataNode + ZooKeeper + Spring Boot + Frontend |
| **System B, C, D...** | Replica computers — run DataNode (+ optionally Spring Boot) |
| **NameNode** | The brain of HDFS — tracks which files are on which DataNode |
| **DataNode** | A storage worker — stores actual file data |

---

### Step 1: Find Your IP Addresses

All systems must be on the **same WiFi/LAN network**.

**macOS / Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows (CMD or PowerShell):**
```cmd
ipconfig
```
Look for `IPv4 Address` under your Wi-Fi or Ethernet adapter.

> **Example IPs used in this guide:**
> - System A = `192.168.1.100`
> - System B = `192.168.1.101`
>
> **Replace with YOUR actual IPs everywhere below!**

---

### Step 2: Install Hadoop on All Systems

#### macOS (Homebrew)
```bash
brew install hadoop
```

#### Linux (Ubuntu/Debian)
```bash
# Download Hadoop 3.3.6
wget https://dlcdn.apache.org/hadoop/common/hadoop-3.3.6/hadoop-3.3.6.tar.gz
tar -xzf hadoop-3.3.6.tar.gz
sudo mv hadoop-3.3.6 /usr/local/hadoop

# Add to ~/.bashrc
echo 'export HADOOP_HOME=/usr/local/hadoop' >> ~/.bashrc
echo 'export PATH=$PATH:$HADOOP_HOME/bin:$HADOOP_HOME/sbin' >> ~/.bashrc
source ~/.bashrc
```

#### Windows (IMPORTANT — Extra Steps!)

1. **Download** Hadoop 3.3.6 from [hadoop.apache.org/releases.html](https://hadoop.apache.org/releases.html)
2. **Extract** to `C:\hadoop`
3. **Download `winutils.exe`** — This is CRITICAL, Hadoop will NOT work on Windows without it:
   - Go to: [github.com/cdarlint/winutils](https://github.com/cdarlint/winutils)
   - Download the `bin/` folder for your Hadoop version (e.g., `hadoop-3.3.6/bin/`)
   - Copy `winutils.exe` and `hadoop.dll` into `C:\hadoop\bin\`
4. **Set Environment Variables** (System Properties → Environment Variables):
   
   | Variable | Value |
   |---|---|
   | `JAVA_HOME` | `C:\Program Files\Java\jdk-11` (your JDK path) |
   | `HADOOP_HOME` | `C:\hadoop` |
   
   Add to `Path`: `C:\hadoop\bin` and `C:\hadoop\sbin`

5. **Create data directories:**
   ```powershell
   mkdir C:\hadoop\data\namenode
   mkdir C:\hadoop\data\datanode
   ```

6. **Verify:**
   ```powershell
   hadoop version
   ```

---

### Step 3: Configure Hadoop on System A (NameNode)

Edit these files in your Hadoop installation (`$HADOOP_HOME/etc/hadoop/`):

**`core-site.xml`:**
```xml
<configuration>
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://192.168.1.100:9000</value>
    </property>
</configuration>
```

**`hdfs-site.xml`:**
```xml
<configuration>
    <property>
        <name>dfs.replication</name>
        <value>2</value>
    </property>
    <property>
        <name>dfs.namenode.http-address</name>
        <value>192.168.1.100:9870</value>
    </property>
    <property>
        <name>dfs.permissions.enabled</name>
        <value>false</value>
    </property>
</configuration>
```

**`workers`:**
```text
192.168.1.100
192.168.1.101
```
> Add one IP per line for every system you want as a DataNode.

---

### Step 4: Configure Hadoop on System B (and any other replicas)

Edit the same files in System B's Hadoop installation:

**`core-site.xml`:**
```xml
<configuration>
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://192.168.1.100:9000</value>
    </property>
</configuration>
```
> Notice: this points to **System A's IP**, NOT System B's!

**`hdfs-site.xml`** (if Windows, add the `dfs.datanode.data.dir`):
```xml
<configuration>
    <property>
        <name>dfs.replication</name>
        <value>2</value>
    </property>
    <property>
        <name>dfs.permissions.enabled</name>
        <value>false</value>
    </property>
    <!-- Windows only: specify the datanode directory -->
    <property>
        <name>dfs.datanode.data.dir</name>
        <value>file:///C:/hadoop/data/datanode</value>
    </property>
</configuration>
```

---

### Step 5: Open Firewall Ports

Hadoop uses several network ports. If your systems can't see each other, firewall is usually the reason.

**Windows (PowerShell as Administrator):**
```powershell
netsh advfirewall firewall add rule name="Hadoop NameNode" dir=in action=allow protocol=TCP localport=9000
netsh advfirewall firewall add rule name="Hadoop DataNode" dir=in action=allow protocol=TCP localport=9866
netsh advfirewall firewall add rule name="Hadoop DataNode IPC" dir=in action=allow protocol=TCP localport=9867
netsh advfirewall firewall add rule name="Hadoop DataNode HTTP" dir=in action=allow protocol=TCP localport=9868
netsh advfirewall firewall add rule name="Hadoop Web UI" dir=in action=allow protocol=TCP localport=9870
netsh advfirewall firewall add rule name="Spring Boot" dir=in action=allow protocol=TCP localport=8081
```

**macOS:**
```bash
# Check firewall status
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
# If enabled, either disable or add exceptions for Java
```

**Linux:**
```bash
sudo ufw allow 9000
sudo ufw allow 9866:9868/tcp
sudo ufw allow 9870
sudo ufw allow 8081
```

---

### Step 6: Format and Start the Cluster

**On System A ONLY:**
```bash
# Format the NameNode (ONLY do this once, or on a fresh start)
hdfs namenode -format

# Start the cluster
start-dfs.sh
```

**On System B — Start the DataNode manually:**

*macOS / Linux:*
```bash
hdfs datanode
```

*Windows (PowerShell):*
```powershell
hdfs datanode
```
> Keep this terminal open — closing it stops the DataNode.

**Verify the cluster is working:**
```bash
hdfs dfsadmin -report
```
You should see **2 (or more) Live datanodes** listed with their IPs.

Also open the **Hadoop Web UI** in your browser:
```
http://192.168.1.100:9870
```
Go to **Datanodes** tab — you should see all your connected systems listed!

---

### Step 7: Update `application.properties`

On **every system** running Spring Boot, edit `src/main/resources/application.properties`:

```properties
spring.application.name=ecomm-distributed-hadoop
server.port=8081

# Point to System A's NameNode IP
hdfs.namenode.url=hdfs://192.168.1.100:9000
hdfs.replication=2
hdfs.base.path=/ecomm

# Point to System A's ZooKeeper
zookeeper.address=192.168.1.100:2181
zookeeper.timeout=5000
```

> **Replace `192.168.1.100` with your actual System A IP!**

---

### Step 8: Start Everything

**System A (Main):**
```bash
# 1. ZooKeeper
zkServer start

# 2. HDFS (if not already running)
start-dfs.sh

# 3. Backend
mvn clean install -DskipTests
mvn spring-boot:run

# 4. Frontend (in new terminal)
cd frontend && npm install && npm run dev -- --host
```

**System B (Replica):**
```bash
# 1. DataNode (if not started by System A)
hdfs datanode

# 2. (Optional) Backend — to prove shared storage
mvn clean install -DskipTests
mvn spring-boot:run
```

---

### Step 9: Use the Cluster Dashboard

1. Open `http://SYSTEM_A_IP:5173` in any browser
2. Login as **admin**
3. Click the **🌐 Cluster** button in the top navbar
4. The dashboard shows:
   - **Connected Systems** — All active DataNodes with IP addresses
   - **Storage Summary** — File counts per data category
   - **File Distribution Map** — Which DataNode stores which files
   - **Replication Proof** — Every file shows ×2 replication across nodes
   - **Live Activity Feed** — Real-time HDFS operation log

---

## 🔌 Cluster Monitoring API Endpoints

These are available at `http://SYSTEM_A_IP:8081/api`:

| Endpoint | Description |
|---|---|
| `GET /api/cluster/health` | Full cluster report: DataNodes, replication, storage summary |
| `GET /api/cluster/nodes` | All active DataNodes with IP, capacity, block count |
| `GET /api/cluster/files` | File distribution — which DataNodes hold each file |
| `GET /api/cluster/activity?limit=20` | Recent HDFS file operations with timestamps |

Example:
```bash
curl http://192.168.1.100:8081/api/cluster/health | python3 -m json.tool
```

---

## 🧰 Troubleshooting

| Problem | Solution |
|---|---|
| Only 1 DataNode showing | Check firewall rules (Step 5) and ensure both systems are on the same network |
| `winutils.exe` error on Windows | Download from [github.com/cdarlint/winutils](https://github.com/cdarlint/winutils) |
| `Connection refused` | Check that NameNode is running on System A (`jps` should show `NameNode`) |
| `Incompatible clusterIDs` | Delete `datanode/current/` folder on System B and restart DataNode |
| `Could not resolve hostname` | Use IP addresses everywhere, not hostnames |
| Hadoop Web UI not loading | Try `http://IP:9870` instead of `localhost:9870` |
| DataNode starts but disconnects | Ensure **exact same Hadoop version** on all systems |

---

## 🛑 Shutting Down Safely

**System A:**
```bash
# 1. Ctrl+C on Frontend
# 2. Ctrl+C on Spring Boot
# 3. Stop Hadoop
stop-dfs.sh
# 4. Stop ZooKeeper
zkServer stop
```

**System B:**
```bash
# Ctrl+C on DataNode and Spring Boot (if running)
```

---

## 🤝 Contributing
Feel free to fork this project, submit issues, or create pull requests. Because this is a distributed system, ensure any feature additions maintain fault-tolerance and handle node unavailability gracefully!
