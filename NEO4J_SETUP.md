# Neo4j Setup Guide

## Installation

Neo4j is already installed on this system:
- Binary location: `/usr/bin/neo4j`
- Version: Neo4j 2026.02.3 Community
- Config: `/etc/neo4j/neo4j.conf`
- Data: `/var/lib/neo4j/data`
- Logs: `/var/log/neo4j/neo4j.log`

## Current Configuration

### Authentication
**Disabled for development** (in `/etc/neo4j/neo4j.conf`):
```conf
dbms.security.auth_enabled=false
```

### Ports
- **Bolt**: `localhost:7687` (used by application)
- **HTTP UI**: `localhost:7474` (Neo4j Browser)

## Starting/Stopping Neo4j

```bash
# Start
sudo systemctl start neo4j

# Stop
sudo systemctl stop neo4j

# Restart
sudo systemctl restart neo4j

# Check status
sudo systemctl status neo4j
```

## Accessing Neo4j Browser

Open: http://localhost:7474

**Note**: Authentication is currently disabled, so no login required.

## Application Configuration

The application uses the following settings in `.env`:

```env
# Neo4j connection
GRAPH_DB_URI=bolt://localhost:7687
GRAPH_DB_USERNAME=
GRAPH_DB_PASSWORD=

# Use Neo4j (not mock)
USE_MOCK_DB=false
```

## Testing Connection

```bash
# Test HTTP API
curl http://localhost:7474

# Expected output:
# {
#   "bolt_routing": "neo4j://localhost:7687",
#   "query": "http://localhost:7474/db/{databaseName}/query/v2",
#   ...
# }

# Test Bolt connection
# (Done via application - see backend.log)
```

## Enabling Authentication (Production)

For production use, enable authentication:

```bash
# 1. Edit config
sudo nano /etc/neo4j/neo4j.conf

# 2. Uncomment this line:
# dbms.security.auth_enabled=false
# Change to:
# dbms.security.auth_enabled=true

# 3. Restart Neo4j
sudo systemctl restart neo4j

# 4. Set initial password via Neo4j Browser
# Open http://localhost:7474
# Login with neo4j/neo4j
# Change password when prompted

# 5. Update .env
# Add new credentials to .env file:
# GRAPH_DB_USERNAME=neo4j
# GRAPH_DB_PASSWORD=your_new_password

# 6. Restart application
```

## Troubleshooting

### Neo4j won't start
```bash
# Check logs
sudo tail -50 /var/log/neo4j/neo4j.log

# Check if port is already in use
ss -tlnp | grep 7687

# Check status
sudo systemctl status neo4j
```

### Application can't connect
```bash
# Verify Neo4j is running
sudo systemctl status neo4j

# Check port is listening
ss -tlnp | grep 7687

# Check application logs
tail -50 /home/ubuntu/.openclaw/workspace/local-knowledge-graph/backend.log

# Look for: "✓ Connected to Neo4j graph database"
```

### Connection refused
```bash
# Verify neo4j.conf allows localhost connections
sudo grep "dbms.default_listen_address" /etc/neo4j/neo4j.conf

# Default should be: 0.0.0.0 or 127.0.0.1
```

## Performance Tuning

### Memory Settings
In `/etc/neo4j/neo4j.conf`:

```conf
# Heap size (default: 128m)
# Increase for larger graphs
dbms.memory.heap.initial_size=512m
dbms.memory.heap.max_size=2g

# Page cache (default: depends on system)
dbms.memory.pagecache.size=1g
```

### Connection Settings
```conf
# Max concurrent connections
dbms.connector.bolt.thread_pool_max_size=400

# Connection timeout
dbms.connector.bolt.thread_pool_keep_alive=300s
```

## Data Management

### Clear Database (via Neo4j Browser)
```cypher
MATCH (n) DETACH DELETE n
```

### Clear Database (via CLI)
```bash
# Stop Neo4j
sudo systemctl stop neo4j

# Delete data
sudo rm -rf /var/lib/neo4j/data/*

# Start Neo4j
sudo systemctl start neo4j
```

### Backup Database
```bash
# Stop Neo4j
sudo systemctl stop neo4j

# Backup data directory
sudo cp -r /var/lib/neo4j/data /backup/neo4j-data-$(date +%Y%m%d)

# Start Neo4j
sudo systemctl start neo4j
```

## Monitoring

### Check database size
```bash
sudo du -sh /var/lib/neo4j/data
```

### Check node count (via Cypher)
```cypher
MATCH (n) RETURN count(n) as nodeCount
```

### Check connection count
```cypher
CALL dbms.listConnections() YIELD connection
RETURN connection.protocol, connection.serverAddress
```

## Security Notes

⚠️ **Development Setup**
- Authentication is DISABLED
- Only accessible from localhost
- Not suitable for production

✅ **Production Setup Required**
- Enable authentication
- Set strong password
- Configure SSL/TLS
- Restrict network access
- Regular backups

---

**Last Updated**: 2026-03-21
**Status**: ✅ Neo4j running and connected
