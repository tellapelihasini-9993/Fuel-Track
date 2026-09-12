import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import path from 'path';

const dir = path.resolve(__dirname, '..');
const url = 'https://github.com/udaykumarreddy07/fueltrack-presentation.git';

async function main() {
  console.log('📂 Working Directory:', dir);

  // 1. Initialize git if not already initialized
  const gitDir = path.join(dir, '.git');
  if (!fs.existsSync(gitDir)) {
    console.log('🌱 Initializing Git repository...');
    await git.init({ fs, dir, defaultBranch: 'main' });
  } else {
    console.log('📁 Existing Git repository detected.');
  }

  // 2. Set remote origin
  try {
    await git.addRemote({ fs, dir, remote: 'origin', url, force: true });
    console.log(`🔗 Remote 'origin' set to: ${url}`);
  } catch (err: any) {
    console.log('Remote note:', err.message);
  }

  // 3. Check remote info and branch
  try {
    const remoteInfo = await git.getRemoteInfo({ http, url });
    console.log('📡 Remote Branches:', remoteInfo.branches ? Object.keys(remoteInfo.branches) : 'None');
  } catch (err: any) {
    console.log('📡 Remote fetch info:', err.message);
  }

  // 4. Status and staging
  console.log('🔍 Checking file status...');
  const statusMatrix = await git.statusMatrix({ fs, dir });
  console.log(`📊 Total tracked/untracked items: ${statusMatrix.length}`);

  // Stage all files that are not ignored by .gitignore
  for (const [filepath, head, workdir, stage] of statusMatrix) {
    if (filepath.startsWith('node_modules') || filepath.startsWith('client/node_modules') || filepath.startsWith('.git')) {
      continue;
    }
    if (workdir === 2 || workdir === 1) { // modified or new
      await git.add({ fs, dir, filepath });
    } else if (workdir === 0 && head === 1) { // deleted
      await git.remove({ fs, dir, filepath });
    }
  }

  console.log('✅ Files staged according to .gitignore.');

  // 5. Commit
  const sha = await git.commit({
    fs,
    dir,
    message: 'Add FuelTrack real-time fuel delivery project',
    author: {
      name: 'udaykumarreddy07',
      email: 'udaykumarreddy07@users.noreply.github.com'
    }
  });

  console.log(`📝 Created commit: ${sha}`);

  // 6. Push
  console.log('🚀 Pushing to origin main...');
  try {
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: 'main',
      force: true
    });
    console.log('🎉 Push Result:', pushResult);
  } catch (err: any) {
    console.error('Push error / authentication check:', err.message);
  }
}

main().catch(console.error);
