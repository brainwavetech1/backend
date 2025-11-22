import { exec } from 'child_process';
import path from 'path';

export function runBackup() {
  if (process.env.BACKUP_DISABLED === 'true') {
    console.log('[backup] skipped (disabled)');
    return;
  }
  const dumpCmd = process.env.MONGODUMP_CMD || 'mongodump';
  const backupDir = process.env.BACKUP_DIR || path.resolve(process.cwd(), 'backups');
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/energy';
  const cmd = `${dumpCmd} --uri="${uri}" --out="${backupDir}/${Date.now()}"`;
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error('[backup] failed', err.message, stderr);
      return;
    }
    console.log('[backup] completed', stdout.trim());
  });
}
