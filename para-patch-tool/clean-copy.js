#!/usr/bin/env node
const { resolve } = require('path');
const pkgDir = require('pkg-dir');
const { exec } = require('promisify-child-process');
const { program } = require('commander');
const writeFile = require('fs').writeFileSync;



(async () => {
  const mainDir = await pkgDir(__dirname);
  const packagePath = resolve(mainDir, 'package.json');
  const json = require(packagePath);

  program
    .description(`Set 'ground truth' copy of project to diff against.`)
    .option('-r, --remote <url>', 'The remote repository to diff against during the patch process')
    .option('-b, --branch <name>', 'The branch to use on the specified remote. Will set to latest commit on branch.')
    .option('-c, --commit <hash>', 'The commit to use on the specified remote.');

  program.parse(process.argv);

  if (!json.hasOwnProperty('para-patch-tool')) {
    json['para-patch-tool'] = {};
  }

  const options = program.opts();
  const { remote, branch, commit } = options;

  // Only throw remote error if remote doesn't exist. Otherwise, let the user set just branch/commit.
  if (!remote && !json['para-patch-tool']['remote']) throw new Error('No remote found - please provide a URL!');
  if (branch && commit) throw new Error('Cannot use --branch and --commit together - choose one!');

  if (remote) {
    if (remote !== json['para-patch-tool']['remote']) {
      delete json['para-patch-tool']['commit'];
      
      try {
        await exec(`git remote remove patch-diff`);
      } catch(err) {}
      const { stderr: remoteErr } = await exec(`git remote add patch-diff ${remote}`);
      if (remoteErr) throw new Error(remoteErr);
    }

    json['para-patch-tool']['remote'] = remote;
  }
  const currentRemote = json['para-patch-tool']['remote'];

  // This command gets default branch based on remote.
  const { stdout: defaultBranch, stderr: branchErr } = await exec(`git remote show ${currentRemote} | grep 'HEAD branch' | cut -d' ' -f5 | tr -d '\n'`);
  if (branchErr) throw new Error(branchErr);

  // This command gets us the latest commit based on remote and default branch.
  const { stdout: defaultCommit, stderr: commitErr } = await exec(`git ls-remote ${currentRemote} ${defaultBranch} | cut -c 1-40 | tr -d '\n'`);
  if (commitErr) throw new Error(commitErr);

  // Initially set 
  let result = json['para-patch-tool']['commit'];
  if (!result) result = defaultCommit;
  
  if (branch) {
    // Set branch AS latest commit
    const { stdout: commitFromBranch, stderr: commitFromBranchErr } = await exec(`git ls-remote ${currentRemote} ${branch} | cut -c 1-40 | tr -d '\n'`);
    if (commitFromBranchErr) throw new Error(commitFromBranchErr);
    result = commitFromBranch;
  } else if (commit) {
    // Set commit directly
    result = commit;
  }

  json['para-patch-tool']['commit'] = result;

  try {
    writeFile(packagePath, JSON.stringify(json, null, 2));
  } catch (err) {
    throw new Error(err);
  }

  const { stdout: commitFromBranch, stderr: commitFromBranchErr } = await exec(`git ls-remote ${currentRemote} ${branch} | cut -c 1-40 | tr -d '\n'`);
  if (commitFromBranchErr) throw new Error(commitFromBranchErr);
})();