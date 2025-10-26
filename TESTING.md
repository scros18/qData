# QData Testing Guide

## How to Test the Application

### 1. Start the Application

```bash
npm run dev
```

Open http://localhost:3000/qdata in your browser.

### 2. Test with Local MySQL

**Setup MySQL (if not installed):**

Windows (using Chocolatey):
```powershell
choco install mysql
```

Or download from: https://dev.mysql.com/downloads/mysql/

**Test Connection:**
- Host: `localhost`
- Port: `3306`
- User: `root`
- Password: (your MySQL root password)
- Database: (leave empty)

### 3. Test with Docker MySQL

Quick MySQL setup with Docker:

```bash
docker run --name qdata-mysql -e MYSQL_ROOT_PASSWORD=testpass -p 3306:3306 -d mysql:8

# Wait a few seconds for MySQL to start, then test
docker exec -it qdata-mysql mysql -uroot -ptestpass -e "SHOW DATABASES;"
```

Then in QData:
- Host: `localhost`
- Port: `3306`
- User: `root`
- Password: `testpass`
- Database: (leave empty)

### 4. Test with BlissHairStudio VPS

Follow the SETUP_GUIDE.md for VPS configuration.

### 5. Expected Behavior

✅ **After Connection:**
1. Should see "Connected" indicator in header
2. Sidebar shows list of databases
3. Click a database to see its tables
4. Can switch between Browse and Query tabs
5. Connection details are saved (reload page and they persist)
6. "Disconnect" button clears connection

✅ **Features to Test:**
- [ ] Connect to MySQL
- [ ] View databases list
- [ ] Search databases
- [ ] Select a database
- [ ] View tables in database
- [ ] Dark/light theme toggle
- [ ] Connection persistence (reload page)
- [ ] Disconnect functionality
- [ ] Error handling (wrong password, etc.)

### 6. Common Issues

**Can't connect to localhost:**
- Check if MySQL is running: `mysql -uroot -p`
- Check port: `netstat -an | findstr 3306`

**Access Denied:**
- Verify username and password
- Check user permissions: `SELECT user, host FROM mysql.user;`

**No databases showing:**
- Grant permissions: `GRANT ALL PRIVILEGES ON *.* TO 'your_user'@'%';`
- Flush privileges: `FLUSH PRIVILEGES;`

### 7. Test Data Setup

Create test database and tables:

```sql
CREATE DATABASE qdata_test;
USE qdata_test;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    price DECIMAL(10,2),
    stock INT
);

INSERT INTO users (name, email) VALUES 
    ('John Doe', 'john@example.com'),
    ('Jane Smith', 'jane@example.com');

INSERT INTO products (name, price, stock) VALUES
    ('Product A', 29.99, 100),
    ('Product B', 49.99, 50);
```

Now you should see `qdata_test` database with 2 tables!

---

**Need Help?** Check the README.md or SETUP_GUIDE.md
