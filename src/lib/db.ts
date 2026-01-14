import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'pinsetter.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS machines (
    id TEXT PRIMARY KEY,
    number INTEGER NOT NULL,
    status TEXT NOT NULL,
    lastServiceDate TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id TEXT PRIMARY KEY,
    machineId TEXT NOT NULL,
    taskId TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (machineId) REFERENCES machines(id)
  );

  CREATE TABLE IF NOT EXISTS maintenance_records (
    id TEXT PRIMARY KEY,
    machineId TEXT NOT NULL,
    taskId TEXT NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    completedAt TEXT NOT NULL,
    technicianName TEXT,
    scheduledDate TEXT,
    FOREIGN KEY (machineId) REFERENCES machines(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    data TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY DEFAULT 'current',
    closedDays TEXT NOT NULL,
    dayCapacities TEXT NOT NULL,
    preferredDays TEXT NOT NULL,
    spreadMethod TEXT NOT NULL,
    issueThresholds TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    pin TEXT NOT NULL,
    role TEXT NOT NULL,
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS machine_issues (
    id TEXT PRIMARY KEY,
    machineId TEXT NOT NULL,
    type TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    resolved INTEGER DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (machineId) REFERENCES machines(id)
  );
`);

// Add settings table columns if they don't exist (Migration)
try {
  const tableInfo = db.prepare("PRAGMA table_info(settings)").all() as any[];
  if (tableInfo.length > 0) {
    const columns = tableInfo.map(c => c.name);
    
    if (!columns.includes('issueThresholds')) {
      db.prepare("ALTER TABLE settings ADD COLUMN issueThresholds TEXT NOT NULL DEFAULT '{}'").run();
    }
    if (!columns.includes('spreadMethod')) {
      db.prepare("ALTER TABLE settings ADD COLUMN spreadMethod TEXT NOT NULL DEFAULT 'even'").run();
    }
  }
} catch (e) {
  console.error("Migration error:", e);
}

// Initial data migration
const INITIAL_MACHINES = Array.from({ length: 20 }, (_, i) => ({
  id: `machine-${i + 1}`,
  number: i + 1,
  status: i + 1 === 19 || i + 1 === 20 ? 'permanently_down' : 'active',
}));

const DEFAULT_SETTINGS = {
  closedDays: JSON.stringify([0, 5, 6]),
  dayCapacities: JSON.stringify({
    1: 2, 2: 2, 3: 2, 4: 1, 5: 0, 6: 0, 0: 0
  }),
  preferredDays: JSON.stringify([1, 2]),
  spreadMethod: 'even',
  issueThresholds: JSON.stringify({
    pin_drop: 5,
    scoring: 3,
    interlock: 2,
    ball_return: 4,
    other: 5,
  })
};

const INITIAL_USERS = [
  {
    id: 'admin-1',
    name: 'System Admin',
    pin: '1234',
    role: 'admin',
    active: 1,
  }
];

// Check if tables are empty and populate defaults
const machineCount = db.prepare('SELECT COUNT(*) as count FROM machines').get() as { count: number };
if (machineCount.count === 0) {
  const insertMachine = db.prepare('INSERT INTO machines (id, number, status) VALUES (?, ?, ?)');
  const transaction = db.transaction((machines) => {
    for (const machine of machines) {
      insertMachine.run(machine.id, machine.number, machine.status);
    }
  });
  transaction(INITIAL_MACHINES);
}

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  const insertUser = db.prepare('INSERT INTO users (id, name, pin, role, active) VALUES (?, ?, ?, ?, ?)');
  const transaction = db.transaction((users) => {
    for (const user of users) {
      insertUser.run(user.id, user.name, user.pin, user.role, user.active);
    }
  });
  transaction(INITIAL_USERS);
}

const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
if (settingsCount.count === 0) {
  db.prepare(`
    INSERT INTO settings (id, closedDays, dayCapacities, preferredDays, spreadMethod, issueThresholds)
    VALUES ('current', ?, ?, ?, ?, ?)
  `).run(
    DEFAULT_SETTINGS.closedDays,
    DEFAULT_SETTINGS.dayCapacities,
    DEFAULT_SETTINGS.preferredDays,
    DEFAULT_SETTINGS.spreadMethod,
    DEFAULT_SETTINGS.issueThresholds
  );
}

export default db;
