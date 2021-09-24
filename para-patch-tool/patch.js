#!/usr/bin/env node
const { resolve } = require('path');
const pkgDir = require('pkg-dir');
const { exec } = require('promisify-child-process');
const { program } = require('commander');
const { writeFileSync, mkdirSync, existsSync } = require('fs');

(async () => {
  const mainDir = await pkgDir(__dirname);
  const packagePath = resolve(mainDir, 'package.json');
  const patchesPath = resolve(mainDir, 'para-patches');
  const json = require(packagePath);

  if (!existsSync(patchesPath)) {
    mkdirSync(patchesPath);
  }

  const { remote, commit } = json["para-patch-tool"];

  const { stdout: currentBranch, stderr: err } = await exec(`git branch -show-current | tr -d '\n'`);
  const { stdout: diff, stderr: err } = await exec(`git diff ${currentBranch} ${remote}/${commit}`);
  console.log(diff);
})();

function checkDiffCopy() {
  // Check for diff copy here
}

function getDiffCopy() {
  // Get diff copy here
  // 1. 
}
