#!/usr/bin/env node
const { resolve } = require('path');
const pkgDir = require('pkg-dir');
const { exec } = require('promisify-child-process');
const { program } = require('commander');
const { writeFileSync, mkdirSync, existsSync } = require('fs');

(async () => {
  const mainDir = await pkgDir(__dirname);
  const patchesPath = resolve(mainDir, 'para-patches');

  if (!existsSync(patchesPath)) {
    throw new Error("Patch folder not found!");
  }

  // const { commit } = json["para-patch-tool"];
  // try {
  //   await exec(`git fetch patch-diff`);
  // } catch (err) {
  //   throw new Error(err);
  // }
  // const { stdout: currentBranch, stderr: branchErr } = await exec(`git branch --show-current | tr -d '\n'`);
  // if (branchErr) throw new Error(branchErr);
  const { stderr: diffErr } = await exec(`git apply -R ${patchesPath}/my-patch.patch`);
  if (diffErr) throw new Error(diffErr);
})();

function checkDiffCopy() {
  // Check for diff copy here
}

function getDiffCopy() {
  // Get diff copy here
  // 1. 
}
