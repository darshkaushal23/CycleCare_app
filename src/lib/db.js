const DB_NAME = "cyclecare-db";
const DB_VERSION = 1;

const STORES = {
  settings: "settings",
  periods: "periods",
  logs: "logs",
};

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.settings)) {
        db.createObjectStore(STORES.settings);
      }
      if (!db.objectStoreNames.contains(STORES.periods)) {
        const periods = db.createObjectStore(STORES.periods, { keyPath: "id" });
        periods.createIndex("startDate", "startDate", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.logs)) {
        const logs = db.createObjectStore(STORES.logs, { keyPath: "date" });
        logs.createIndex("date", "date", { unique: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getSettings() {
  const db = await openDatabase();
  try {
    return (await requestToPromise(db.transaction(STORES.settings).objectStore(STORES.settings).get("profile"))) ?? null;
  } finally {
    db.close();
  }
}

export async function saveSettings(settings) {
  const db = await openDatabase();
  const tx = db.transaction(STORES.settings, "readwrite");
  tx.objectStore(STORES.settings).put(settings, "profile");
  await txDone(tx);
  db.close();
}

export async function getAllPeriods() {
  const db = await openDatabase();
  try {
    const periods = await requestToPromise(db.transaction(STORES.periods).objectStore(STORES.periods).getAll());
    return (periods ?? []).sort((a, b) => a.startDate.localeCompare(b.startDate));
  } finally {
    db.close();
  }
}

export async function putPeriod(period) {
  const db = await openDatabase();
  const tx = db.transaction(STORES.periods, "readwrite");
  tx.objectStore(STORES.periods).put(period);
  await txDone(tx);
  db.close();
}

export async function replaceAllPeriods(periods) {
  const db = await openDatabase();
  const tx = db.transaction(STORES.periods, "readwrite");
  const store = tx.objectStore(STORES.periods);
  store.clear();
  periods.forEach((period) => store.put(period));
  await txDone(tx);
  db.close();
}

export async function getAllLogs() {
  const db = await openDatabase();
  try {
    const logs = await requestToPromise(db.transaction(STORES.logs).objectStore(STORES.logs).getAll());
    return (logs ?? []).sort((a, b) => a.date.localeCompare(b.date));
  } finally {
    db.close();
  }
}

export async function putLog(log) {
  const db = await openDatabase();
  const tx = db.transaction(STORES.logs, "readwrite");
  tx.objectStore(STORES.logs).put(log);
  await txDone(tx);
  db.close();
}

export async function replaceAllLogs(logs) {
  const db = await openDatabase();
  const tx = db.transaction(STORES.logs, "readwrite");
  const store = tx.objectStore(STORES.logs);
  store.clear();
  logs.forEach((log) => store.put(log));
  await txDone(tx);
  db.close();
}

export async function getLog(date) {
  const db = await openDatabase();
  try {
    return (await requestToPromise(db.transaction(STORES.logs).objectStore(STORES.logs).get(date))) ?? null;
  } finally {
    db.close();
  }
}

export async function deleteLog(date) {
  const db = await openDatabase();
  const tx = db.transaction(STORES.logs, "readwrite");
  tx.objectStore(STORES.logs).delete(date);
  await txDone(tx);
  db.close();
}

export async function clearAllData() {
  const db = await openDatabase();
  const tx = db.transaction([STORES.settings, STORES.periods, STORES.logs], "readwrite");
  tx.objectStore(STORES.settings).clear();
  tx.objectStore(STORES.periods).clear();
  tx.objectStore(STORES.logs).clear();
  await txDone(tx);
  db.close();
}

export { STORES, DB_NAME };
