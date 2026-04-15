# Git Troubleshooting Documentation

## Issue: Remote Master Branch Not Showing Locally

### Problem Description
When collaborating with another person who uses the `master` branch, you may find that the master branch exists on the remote repository but is not available as a local branch on your machine.

**Symptoms:**
- `git checkout master` fails with an error
- `git branch` only shows your current local branches (e.g., `main`)
- `git branch -a` shows `remotes/origin/master` but no local `master` branch

**Example Error:**
```
error: pathspec 'master' did not match any file(s) known to git
```

### Root Cause
This typically occurs when:
1. The repository was initialized with a default branch of `main` (modern Git convention)
2. You cloned the repository and only received the default branch locally
3. Remote branches exist but haven't been checked out as local tracking branches

The remote branch `origin/master` exists on the server, but Git hasn't created a corresponding local branch to track it.

---

## Solution

### Step 1: Fetch Latest Changes from Remote
```bash
git fetch origin
```
This ensures you have the latest information about all remote branches.

### Step 2: Create Local Tracking Branch
```bash
git checkout --track origin/master
```
This command:
- Creates a new local `master` branch
- Automatically sets it to track `origin/master`
- Switches you to the new branch

**Or use the modern syntax:**
```bash
git checkout master
```
(Modern Git automatically creates a tracking branch if only a remote version exists)

### Step 3: Verify the Branch
```bash
git branch -a
git status
```

**Expected output:**
```
* master                    (currently on this branch)
  main
  remotes/origin/HEAD -> origin/main
  remotes/origin/main
  remotes/origin/master
```

---

## Complete Command Sequence
```bash
# Navigate to your repo
cd /Users/humdevesh/Expo-skia

# Fetch all remote branches
git fetch origin

# Create local master branch tracking origin/master
git checkout --track origin/master

# Verify
git branch -a
git status
```

---

## Prevention & Best Practices

### 1. **After Cloning a Repository**
Always check what branches are available:
```bash
git branch -a
```
If you need a specific branch, create a tracking branch immediately:
```bash
git checkout --track origin/BRANCH_NAME
```

### 2. **When Collaborating**
- Ask your collaborators which branch they work on
- Create tracking branches for all branches you'll be using
- Update periodically with `git fetch origin`

### 3. **Switching Between Branches**
Instead of:
```bash
git checkout main      # might fail if main doesn't exist locally
```

Use:
```bash
git checkout -t origin/main    # creates local branch if needed
```

### 4. **List All Available Remote Branches**
```bash
git branch -r    # shows all remote branches
git branch -a    # shows all local and remote branches
```

---

## Related Commands

| Command | Purpose |
|---------|---------|
| `git branch -a` | Show all local and remote branches |
| `git branch -r` | Show only remote branches |
| `git branch -v` | Show local branches with last commit |
| `git fetch origin` | Download updates from remote without merging |
| `git pull origin BRANCH` | Fetch and merge a specific branch |
| `git checkout --track origin/BRANCH` | Create local branch tracking a remote branch |

---

## Troubleshooting Similar Issues

**Problem:** Changes blocking branch switch
```
error: Your local changes to the following files would be overwritten by checkout
```
**Solution:**
```bash
git stash           # Save your changes
git checkout master  # Switch branch
git stash pop       # Restore your changes
```

**Problem:** Need to pull from a different branch
```bash
git pull origin BRANCH_NAME
```

**Problem:** Local branch out of sync with remote
```bash
git fetch origin
git pull origin BRANCH_NAME
```

---

---

# Merging Collaborator Code into Main Branch

## Workflow for Team Collaboration

### Your Setup:
- **Master branch**: Contains collaborator's code (new features, bug fixes)
- **Main branch**: Your production/build branch (stable, deployment ready)

### Process: Merge Master into Main

#### Step 1: Commit Staged Changes (if any)
If you have uncommitted changes on main:
```bash
git add .
git commit -m "Your commit message"
```

#### Step 2: Switch to Main Branch
```bash
git checkout main
```

#### Step 3: Fetch Latest Updates from Collaborator
```bash
git fetch origin
git pull origin master
```
This ensures you have the latest code from the collaborator's master branch.

#### Step 4: Merge Master into Main
```bash
git merge master
```

**What happens:**
- If there are no conflicts: Git automatically merges the changes ✅
- If there are conflicts: You'll need to resolve them manually ⚠️

#### Step 5: Create Build (if merge successful)
```bash
# Build command examples:
# npm run build
# expo build:android
# etc.
```

#### Step 6: Push Updated Main to Remote
```bash
git push origin main
```

---

## Complete Merge Command Sequence

```bash
# Step 1: Commit any local changes
git add .
git commit -m "Your changes before merge"

# Step 2: Switch to main branch
git checkout main

# Step 3: Fetch collaborator's latest code
git fetch origin
git pull origin master

# Step 4: Merge master into main
git merge master

# Step 5: If no conflicts, push to remote
git push origin main

# Step 6: Then build
npm run build    # or your build command
```

---

## Handling Merge Conflicts

If you see:
```
CONFLICT (add/add): ...
Auto-merge failed; fix conflicts and then commit the result
```

### Resolution Steps:

1. **See which files have conflicts:**
```bash
git status
```

2. **Open conflict files in editor:**
Look for conflict markers:
```
<<<<<<< HEAD
  Your code (from main)
=======
  Collaborator's code (from master)
>>>>>>> master
```

3. **Choose which code to keep:**
- Keep collaborator's code:
```bash
git checkout --theirs FILE_NAME
```
- Keep your main code:
```bash
git checkout --ours FILE_NAME
```
- Or manually edit and keep both if needed

4. **Complete the merge:**
```bash
git add .
git commit -m "Merge master into main: resolved conflicts"
git push origin main
```

---

## Recommended Workflow

### Daily/Weekly Process:
1. You work on `main` (stable, for builds)
2. Collaborator commits to `master` (development)
3. Periodically merge `master` → `main`
4. Create builds from `main`

### Visual Flow:
```
master (Collaborator's code)
   ↓
   merge
   ↓
main (Your builds)
   ↓
   Build & Deploy
```

### Commands Checklist:
```bash
# Get collaborator's changes
git checkout main
git fetch origin
git pull origin master

# Merge into your build branch
git merge master

# If conflicts, resolve them:
# - Open files, choose which code to keep
# - git add .
# - git commit -m "message"

# Push to remote
git push origin main

# Create your build
# npm run build / expo build / etc.
```

---

## Undo Merge (if something goes wrong)

If merge causes problems:
```bash
# Undo the merge (before pushing)
git merge --abort

# Or undo after pushing (create a revert commit)
git revert -m 1 COMMIT_HASH
git push origin main
```

---

## Reference Date
- **Created:** April 15, 2026
- **Scenario:** Pulling code from collaborator using `master` branch in Expo-skia project
- **Updated:** April 15, 2026 - Added merge workflow for team collaboration
