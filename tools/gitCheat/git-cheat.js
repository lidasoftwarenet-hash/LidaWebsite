console.log("Git Cheat Sheet JS loaded");
// Expanded Git command database
    const commands = [
      // Basics
      { name: "git init", category: "Basics", desc: "Create an empty Git repository", examples: ["git init", "git init --bare"], difficulty: "beginner", mostUsed: true },
      { name: "git status", category: "Basics", desc: "Show working tree status", examples: ["git status", "git status -s", "git status --porcelain"], difficulty: "beginner", mostUsed: true },
      { name: "git add", category: "Staging", desc: "Add files to staging area", examples: ["git add .", "git add file.txt", "git add -p", "git add -A"], difficulty: "beginner", mostUsed: true },
      { name: "git commit", category: "Commit", desc: "Record changes to repository", examples: ["git commit -m 'message'", "git commit -am 'message'", "git commit --amend"], difficulty: "beginner", mostUsed: true },
      { name: "git push", category: "Remote", desc: "Update remote refs", examples: ["git push", "git push origin main", "git push -f", "git push --tags"], difficulty: "beginner", mostUsed: true },
      { name: "git pull", category: "Remote", desc: "Fetch and merge from remote", examples: ["git pull", "git pull --rebase", "git pull origin feature"], difficulty: "beginner", mostUsed: true },
      { name: "git clone", category: "Remote", desc: "Clone a repository", examples: ["git clone https://github.com/user/repo.git", "git clone --depth 1 url"], difficulty: "beginner", mostUsed: true },
      { name: "git branch", category: "Branching", desc: "List, create, or delete branches", examples: ["git branch", "git branch new-feature", "git branch -d old", "git branch -m new-name"], difficulty: "beginner", mostUsed: true },
      { name: "git checkout", category: "Branching", desc: "Switch branches or restore files", examples: ["git checkout main", "git checkout -b feature", "git checkout -- file.txt"], difficulty: "beginner", mostUsed: true },
      { name: "git merge", category: "Branching", desc: "Join two or more histories", examples: ["git merge feature", "git merge --no-ff feature"], difficulty: "intermediate", mostUsed: true },
      { name: "git log", category: "History", desc: "Show commit history", examples: ["git log", "git log --oneline", "git log --graph --all", "git log -p"], difficulty: "beginner", mostUsed: true },
      { name: "git diff", category: "History", desc: "Show changes between commits", examples: ["git diff", "git diff --staged", "git diff HEAD~1"], difficulty: "beginner", mostUsed: true },
      { name: "git reset", category: "Undo", desc: "Reset current HEAD to specified state", examples: ["git reset --hard HEAD~1", "git reset --soft HEAD^", "git reset file.txt"], difficulty: "intermediate", mostUsed: true },
      { name: "git revert", category: "Undo", desc: "Create new commit that undoes a commit", examples: ["git revert abc123", "git revert --no-commit HEAD"], difficulty: "intermediate" },
      { name: "git stash", category: "Staging", desc: "Stash changes temporarily", examples: ["git stash", "git stash pop", "git stash list", "git stash apply"], difficulty: "intermediate", mostUsed: true },
      { name: "git remote", category: "Remote", desc: "Manage set of tracked repositories", examples: ["git remote -v", "git remote add origin url", "git remote remove origin"], difficulty: "beginner" },
      { name: "git fetch", category: "Remote", desc: "Download objects and refs from another repo", examples: ["git fetch origin", "git fetch --all", "git fetch --prune"], difficulty: "intermediate" },
      { name: "git rebase", category: "Branching", desc: "Reapply commits on top of another base", examples: ["git rebase main", "git rebase -i HEAD~3"], difficulty: "advanced", mostUsed: true },
      { name: "git config", category: "Config", desc: "Get and set configuration options", examples: ["git config --global user.name 'Name'", "git config --list", "git config core.autocrlf true"], difficulty: "beginner" },
      { name: "git tag", category: "Tagging", desc: "Create, list, delete or verify a tag", examples: ["git tag v1.0", "git tag -a v1.0 -m 'message'", "git tag -d v1.0"], difficulty: "intermediate" },
      { name: "git restore", category: "Undo", desc: "Restore working tree files (newer alternative)", examples: ["git restore file.txt", "git restore --staged file.txt"], difficulty: "intermediate" },
      { name: "git switch", category: "Branching", desc: "Switch branches (Git 2.23+)", examples: ["git switch main", "git switch -c new-branch"], difficulty: "intermediate" },
      { name: "git cherry-pick", category: "Branching", desc: "Apply changes from specific commits", examples: ["git cherry-pick abc123", "git cherry-pick --no-commit abc123"], difficulty: "advanced" },
      { name: "git bisect", category: "Debugging", desc: "Use binary search to find the commit that introduced a bug", examples: ["git bisect start", "git bisect bad", "git bisect good abc123"], difficulty: "advanced" },
      { name: "git submodule", category: "Advanced", desc: "Manage submodules", examples: ["git submodule add url", "git submodule update --init"], difficulty: "advanced" },
      { name: "git worktree", category: "Advanced", desc: "Manage multiple working trees", examples: ["git worktree add ../new-branch branch-name"], difficulty: "advanced" },
      { name: "git reflog", category: "History", desc: "Reference logs - recover lost commits", examples: ["git reflog", "git reflog show HEAD"], difficulty: "advanced" },
      { name: "git clean", category: "Cleanup", desc: "Remove untracked files from working tree", examples: ["git clean -n", "git clean -f", "git clean -fd"], difficulty: "intermediate" },
      { name: "git grep", category: "Search", desc: "Search inside files", examples: ["git grep 'pattern'", "git grep -n 'pattern'"], difficulty: "intermediate" },
      { name: "git show", category: "History", desc: "Show various types of objects", examples: ["git show abc123", "git show HEAD"], difficulty: "beginner" },
      { name: "git archive", category: "Export", desc: "Create archive of files from a named tree", examples: ["git archive --format zip --output repo.zip main"], difficulty: "advanced" },
      { name: "git blame", category: "History", desc: "Show what revision and author last modified each line", examples: ["git blame file.txt", "git blame -L 10,20 file.txt"], difficulty: "intermediate" },
      { name: "git describe", category: "Tagging", desc: "Give an object a human readable name based on an available ref", examples: ["git describe --tags"], difficulty: "advanced" },
      { name: "git mv", category: "Basics", desc: "Move or rename a file, directory, or symlink", examples: ["git mv old.txt new.txt"], difficulty: "beginner" },
      { name: "git rm", category: "Basics", desc: "Remove files from working tree and index", examples: ["git rm file.txt", "git rm -r directory/"], difficulty: "beginner" },
      { name: "git shortlog", category: "History", desc: "Summarize git log output", examples: ["git shortlog", "git shortlog -sn"], difficulty: "intermediate" },
      { name: "git whatchanged", category: "History", desc: "Show logs with differences each commit introduces", examples: ["git whatchanged"], difficulty: "intermediate" },
      { name: "git count-objects", category: "Debugging", desc: "Count unpacked objects and disk consumption", examples: ["git count-objects -v"], difficulty: "advanced" },
      { name: "git fsck", category: "Debugging", desc: "Verify connectivity and validity of objects", examples: ["git fsck"], difficulty: "advanced" },
      { name: "git gc", category: "Maintenance", desc: "Cleanup unnecessary files and optimize repository", examples: ["git gc", "git gc --aggressive"], difficulty: "advanced" },
      { name: "git instaweb", category: "Tools", desc: "Instantly browse your repository with gitweb", examples: ["git instaweb --httpd=webrick"], difficulty: "advanced" },
      { name: "git replace", category: "Advanced", desc: "Create, list, delete refs to replace objects", examples: ["git replace -l"], difficulty: "advanced" },
      { name: "git filter-branch", category: "Advanced", desc: "Rewrite branches", examples: ["git filter-branch --env-filter 'command'"], difficulty: "advanced" },
      { name: "git notes", category: "Advanced", desc: "Add or inspect object notes", examples: ["git notes add -m 'note'"], difficulty: "advanced" },
    ];

    const categories = [...new Set(commands.map(c => c.category))];
    const categoryColors = {
      "Basics": "#10b981",
      "Staging": "#f59e0b",
      "Commit": "#8b5cf6",
      "Remote": "#ef4444",
      "Branching": "#3b82f6",
      "History": "#06b6d4",
      "Undo": "#dc2626",
      "Config": "#6b7280",
      "Tagging": "#ec4899",
      "Debugging": "#8b5cf6",
      "Advanced": "#ef4444",
      "Cleanup": "#10b981",
      "Search": "#f59e0b",
      "Export": "#3b82f6",
      "Maintenance": "#64748b",
      "Tools": "#06b6d4"
    };

    // Flag descriptions for common Git options
    const flagDescriptions = {
      "-s": "Short format",
      "--short": "Short format",
      "--porcelain": "Machine‑readable output, suitable for scripting",
      "-m": "Commit message",
      "-a": "Stage all tracked files",
      "-am": "Stage all tracked files and commit with message",
      "-p": "Patch mode (interactive staging)",
      "-A": "Stage all files (including untracked)",
      "--all": "All branches / all files",
      "--hard": "Discard changes completely",
      "--soft": "Keep changes in staging area",
      "--mixed": "Reset staging area but keep working directory changes (default)",
      "--graph": "Show ASCII graph of branch history",
      "--oneline": "One line per commit",
      "--all": "All branches",
      "--prune": "Remove stale remote references",
      "--global": "Set global configuration",
      "--depth": "Shallow clone with limited history",
      "-f": "Force operation",
      "--force": "Force operation",
      "-d": "Delete",
      "-v": "Verbose output",
      "--verbose": "Verbose output",
      "-n": "Dry run (show what would be done)",
      "-i": "Interactive mode",
      "--interactive": "Interactive mode",
      "--no-ff": "Create a merge commit even if fast‑forward is possible",
      "--amend": "Amend previous commit",
      "--bare": "Create a bare repository (no working directory)",
      "--tags": "Push tags",
      "--rebase": "Rebase instead of merge",
      "--no-commit": "Perform merge but do not commit",
      "-L": "Limit output to specific line range",
      "--format": "Specify output format",
      "--stat": "Show statistics",
      "-S": "Search by changes (pickaxe)",
      "--cached": "Show staged changes",
      "--staged": "Show staged changes",
      "--abbrev-commit": "Show abbreviated commit hashes",
      "--relative-date": "Show relative dates",
      "--name-only": "Show only names of changed files",
      "--name-status": "Show names and status of changed files",
      "--color": "Colorize output",
      "--no-color": "Disable color output",
      "--patch": "Interactive patch selection",
      "--reset-author": "Reset author info",
      "--signoff": "Add Signed-off-by line",
      "--squash": "Prepare commit for squash merging",
      "--no-verify": "Bypass pre‑commit hooks",
    };

    // Generate description for an example based on flags
    function getExampleDescription(cmdName, example) {
      const lower = example.toLowerCase();
      const descs = [];
      // Special cases per command
      if (cmdName === "git status") {
        if (lower.includes("-s")) descs.push("Short format");
        if (lower.includes("--porcelain")) descs.push("Machine‑readable output");
      }
      if (cmdName === "git log") {
        if (lower.includes("--oneline")) descs.push("One line per commit");
        if (lower.includes("--graph")) descs.push("ASCII graph visualization");
        if (lower.includes("-p")) descs.push("Show patch (diff)");
      }
      if (cmdName === "git add") {
        if (lower.includes("-p")) descs.push("Interactive patch staging");
        if (lower.includes("-A")) descs.push("Stage all files (including untracked)");
      }
      if (cmdName === "git commit") {
        if (lower.includes("-am")) descs.push("Stage tracked files and commit with message");
        if (lower.includes("--amend")) descs.push("Amend previous commit");
      }
      if (cmdName === "git reset") {
        if (lower.includes("--hard")) descs.push("Discard all changes");
        if (lower.includes("--soft")) descs.push("Keep changes in staging");
      }
      if (cmdName === "git push") {
        if (lower.includes("-f")) descs.push("Force push (overwrites remote)");
        if (lower.includes("--tags")) descs.push("Push tags");
      }
      if (cmdName === "git pull") {
        if (lower.includes("--rebase")) descs.push("Rebase local commits onto remote");
      }
      if (cmdName === "git clone") {
        if (lower.includes("--depth")) descs.push("Shallow clone (limited history)");
      }
      if (cmdName === "git branch") {
        if (lower.includes("-d")) descs.push("Delete branch (safe)");
        if (lower.includes("-D")) descs.push("Force delete branch");
        if (lower.includes("-m")) descs.push("Rename branch");
      }
      if (cmdName === "git checkout") {
        if (lower.includes("-b")) descs.push("Create new branch and switch to it");
        if (lower.includes("--")) descs.push("Discard changes in file");
      }
      if (cmdName === "git merge") {
        if (lower.includes("--no-ff")) descs.push("Always create a merge commit");
      }
      if (cmdName === "git stash") {
        if (lower.includes("pop")) descs.push("Apply and remove stash");
        if (lower.includes("list")) descs.push("List stashes");
        if (lower.includes("apply")) descs.push("Apply stash but keep it");
      }
      if (cmdName === "git clean") {
        if (lower.includes("-n")) descs.push("Dry run (show what would be removed)");
        if (lower.includes("-f")) descs.push("Force removal");
        if (lower.includes("-d")) descs.push("Remove directories too");
      }
      if (cmdName === "git grep") {
        if (lower.includes("-n")) descs.push("Show line numbers");
      }
      if (cmdName === "git shortlog") {
        if (lower.includes("-sn")) descs.push("Summarize by author, sorted by commit count");
      }
      // Fallback: generic flag detection
      if (descs.length === 0) {
        for (const flag in flagDescriptions) {
          if (lower.includes(flag)) {
            descs.push(flagDescriptions[flag]);
            break;
          }
        }
      }
      if (descs.length === 0) {
        return "Basic command with default options.";
      }
      return descs.join(" · ");
    }

    let favorites = JSON.parse(localStorage.getItem("gitFavorites") || "[]");
    let showOnlyFavorites = false;

    function saveFavorites() {
      localStorage.setItem("gitFavorites", JSON.stringify(favorites));
      updateStats();
    }

    function updateStats() {
      document.getElementById("total-commands").textContent = commands.length;
      document.getElementById("favorites-count").textContent = favorites.length;
      document.getElementById("most-used-count").textContent = commands.filter(c => c.mostUsed).length;
      document.getElementById("advanced-count").textContent = commands.filter(c => c.difficulty === "advanced").length;
    }

    function renderFilters() {
      const filtersDiv = document.getElementById("filters");
      filtersDiv.innerHTML = `<button class="filter-btn active" data-cat="all">All (${commands.length})</button>`;
      categories.forEach(cat => {
        const count = commands.filter(c => c.category === cat).length;
        const btn = document.createElement("button");
        btn.className = "filter-btn";
        btn.innerHTML = `${cat} <span class="count">${count}</span>`;
        btn.dataset.cat = cat;
        btn.onclick = () => filterCommands(cat);
        filtersDiv.appendChild(btn);
      });
    }

    function renderCommands(list, containerId) {
      const container = document.getElementById(containerId);
      container.innerHTML = "";
      if (list.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:3rem; color:#64748b;">No commands found. Try a different search or filter.</div>`;
        return;
      }
      list.forEach(cmd => {
        const card = document.createElement("div");
        card.className = `command-card ${cmd.mostUsed ? 'most-used' : ''} ${cmd.difficulty === 'advanced' ? 'advanced' : ''}`;

        const isFav = favorites.includes(cmd.name);
        
        card.innerHTML = `
          <div class="command-header">
            <div style="flex:1;">
              <div class="command-name">${cmd.name}</div>
              <div class="command-desc">${cmd.desc}</div>
              <div class="command-meta">
                <span class="category-badge" style="background:${categoryColors[cmd.category]}">${cmd.category}</span>
                <span class="difficulty ${cmd.difficulty}">${cmd.difficulty}</span>
                ${cmd.mostUsed ? '<span style="color:#f59e0b; font-size:0.8rem;">★ Most Used</span>' : ''}
              </div>
            </div>
            <div class="command-actions">
              <button class="favorite-btn ${isFav ? 'active' : ''}" data-cmd="${cmd.name}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">⭐</button>
            </div>
          </div>
          <div class="details">
            <h4>Examples</h4>
            ${cmd.examples.map(ex => `
              <div class="example">
                <code>${ex}</code>
                <button class="copy-btn">Copy</button>
                <div class="example-desc">${getExampleDescription(cmd.name, ex)}</div>
              </div>
            `).join("")}
            ${cmd.params ? `
              <h4>Parameters</h4>
              <ul class="param-list">
                ${cmd.params.map(p => `<li><span class="param-name">${p.name}</span>: ${p.desc}</li>`).join("")}
              </ul>
            ` : ''}
          </div>
        `;

        card.querySelector(".command-header").onclick = () => {
          card.querySelector(".details").classList.toggle("open");
        };

        card.querySelector(".favorite-btn").onclick = (e) => {
          e.stopPropagation();
          if (favorites.includes(cmd.name)) {
            favorites = favorites.filter(f => f !== cmd.name);
          } else {
            favorites.push(cmd.name);
          }
          saveFavorites();
          renderAll();
        };

        card.querySelectorAll(".copy-btn").forEach(btn => {
          btn.onclick = (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(btn.previousElementSibling.textContent);
            showToast();
          };
        });

        container.appendChild(card);
      });
    }

    function renderAll() {
      const searchVal = document.getElementById("search").value.toLowerCase();
      const activeCat = document.querySelector(".filter-btn.active")?.dataset.cat || "all";

      let filtered = commands.filter(cmd => {
        const matchesSearch = cmd.name.toLowerCase().includes(searchVal) ||
                              cmd.desc.toLowerCase().includes(searchVal) ||
                              cmd.examples.some(ex => ex.toLowerCase().includes(searchVal));
        const matchesCat = activeCat === "all" || cmd.category === activeCat;
        const matchesFav = !showOnlyFavorites || favorites.includes(cmd.name);
        return matchesSearch && matchesCat && matchesFav;
      });

      const favCommands = filtered.filter(c => favorites.includes(c.name));
      const regularCommands = filtered.filter(c => !favorites.includes(c.name));

      if (favCommands.length > 0) {
        document.getElementById("favorites-section").style.display = "block";
        renderCommands(favCommands, "favorites-list");
      } else {
        document.getElementById("favorites-section").style.display = "none";
      }

      renderCommands(regularCommands, "command-list");
    }

    function filterCommands(cat) {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      document.querySelector(`.filter-btn[data-cat="${cat}"]`)?.classList.add("active");
      if (cat === "all") document.querySelector(".filter-btn").classList.add("active");
      renderAll();
    }

    function showToast(message = "Copied to clipboard! ✓") {
      const toast = document.getElementById("toast");
      toast.textContent = message;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2000);
    }

    // Event listeners
    document.getElementById("search").addEventListener("input", renderAll);

    document.getElementById("toggle-favorites").addEventListener("click", () => {
      showOnlyFavorites = !showOnlyFavorites;
      document.getElementById("toggle-favorites").classList.toggle("active", showOnlyFavorites);
      renderAll();
    });

    document.getElementById("export-btn").addEventListener("click", () => {
      // Simple export as JSON
      const data = {
        favorites: favorites,
        commands: commands.filter(c => favorites.includes(c.name)),
        generatedAt: new Date().toISOString(),
        source: "Git Cheat Sheet Pro - https://lidasoftware.online"
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `git-cheat-favorites-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Exported favorites as JSON!");
    });

    // Command Builder
    const commandOptions = {
      commit: [
        { flag: "-m", desc: "Commit message", placeholder: "message" },
        { flag: "-a", desc: "Stage all tracked files before commit" },
        { flag: "--amend", desc: "Amend previous commit" },
        { flag: "--no-verify", desc: "Bypass pre-commit hooks" },
      ],
      push: [
        { flag: "-f", desc: "Force push (overwrites remote)" },
        { flag: "--tags", desc: "Push tags" },
        { flag: "-u", desc: "Set upstream branch" },
        { flag: "--force-with-lease", desc: "Force push only if remote hasn't changed" },
      ],
      pull: [
        { flag: "--rebase", desc: "Rebase instead of merge" },
        { flag: "--no-commit", desc: "Do not commit after merge" },
        { flag: "--ff-only", desc: "Fast-forward only" },
      ],
      log: [
        { flag: "--oneline", desc: "One line per commit" },
        { flag: "--graph", desc: "ASCII graph" },
        { flag: "-p", desc: "Show patch (diff)" },
        { flag: "--stat", desc: "Show statistics" },
        { flag: "--since", desc: "Show commits since date", placeholder: "2024-01-01" },
      ],
      status: [
        { flag: "-s", desc: "Short format" },
        { flag: "--porcelain", desc: "Machine-readable output" },
        { flag: "-b", desc: "Show branch info" },
      ],
      add: [
        { flag: "-A", desc: "Stage all files (including untracked)" },
        { flag: "-p", desc: "Interactive patch mode" },
        { flag: "--dry-run", desc: "Show what would be added" },
      ],
      branch: [
        { flag: "-d", desc: "Delete branch (safe)" },
        { flag: "-D", desc: "Force delete branch" },
        { flag: "-m", desc: "Rename branch" },
        { flag: "-a", desc: "List all branches (remote and local)" },
      ],
      checkout: [
        { flag: "-b", desc: "Create new branch and switch" },
        { flag: "--", desc: "Discard changes in file" },
      ],
      merge: [
        { flag: "--no-ff", desc: "Always create a merge commit" },
        { flag: "--squash", desc: "Squash commits into one" },
        { flag: "--abort", desc: "Abort merge" },
      ],
      rebase: [
        { flag: "-i", desc: "Interactive rebase" },
        { flag: "--continue", desc: "Continue after resolving conflicts" },
        { flag: "--abort", desc: "Abort rebase" },
      ],
    };

    const modal = document.getElementById("builder-modal");
    const closeButtons = document.querySelectorAll(".close-modal");
    const baseCommandSelect = document.getElementById("base-command");
    const optionsContainer = document.getElementById("options-container");
    const argumentsInput = document.getElementById("arguments");
    const generatedCommand = document.getElementById("generated-command");
    const commandDescription = document.getElementById("command-description");
    const copyGeneratedBtn = document.getElementById("copy-generated");
    const insertCommandBtn = document.getElementById("insert-command");

    function openBuilder() {
      modal.classList.add("show");
      updateOptions();
      updateCommand();
    }

    function closeBuilder() {
      modal.classList.remove("show");
    }

    function updateOptions() {
      const cmd = baseCommandSelect.value;
      const options = commandOptions[cmd] || [];
      optionsContainer.innerHTML = "";
      options.forEach(opt => {
        const div = document.createElement("div");
        div.className = "option-checkbox";
        div.innerHTML = `
          <input type="checkbox" id="opt-${opt.flag}" data-flag="${opt.flag}" />
          <label for="opt-${opt.flag}">
            <strong>${opt.flag}</strong> – ${opt.desc}
          </label>
        `;
        optionsContainer.appendChild(div);
      });
      // Add event listeners to checkboxes
      optionsContainer.querySelectorAll("input").forEach(cb => {
        cb.addEventListener("change", updateCommand);
      });
    }

    function updateCommand() {
      const cmd = baseCommandSelect.value;
      let parts = ["git", cmd];
      // Add checked options
      optionsContainer.querySelectorAll("input:checked").forEach(cb => {
        const flag = cb.dataset.flag;
        parts.push(flag);
      });
      // Add arguments
      const args = argumentsInput.value.trim();
      if (args) {
        parts = parts.concat(args.split(/\s+/));
      }
      generatedCommand.textContent = parts.join(" ");
      // Update description
      const cmdObj = commands.find(c => c.name === `git ${cmd}`);
      commandDescription.textContent = cmdObj ? cmdObj.desc : "Custom Git command.";
    }

    function copyGenerated() {
      navigator.clipboard.writeText(generatedCommand.textContent);
      showToast("Command copied to clipboard!");
    }

    function insertIntoSearch() {
      document.getElementById("search").value = generatedCommand.textContent;
      closeBuilder();
      renderAll();
      showToast("Command inserted into search!");
    }

    // Event listeners
    document.getElementById("builder-btn").addEventListener("click", openBuilder);
    closeButtons.forEach(btn => btn.addEventListener("click", closeBuilder));
    baseCommandSelect.addEventListener("change", () => {
      updateOptions();
      updateCommand();
    });
    argumentsInput.addEventListener("input", updateCommand);
    copyGeneratedBtn.addEventListener("click", copyGenerated);
    insertCommandBtn.addEventListener("click", insertIntoSearch);

    // Close modal on outside click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeBuilder();
    });

    // Initialize builder
    updateOptions();
    updateCommand();

    // Print button removed from HTML, so event listener removed.
    // Dark mode toggle removed from HTML, so event listener removed.
    // Load dark mode preference (optional, keep if we add dark mode later)
    if (localStorage.getItem("darkMode") === "true") {
      document.documentElement.classList.add("dark-mode");
    }

    // Initialize
    renderFilters();
    updateStats();
    renderAll();

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.getElementById("search").value = "";
        renderAll();
      }
      if (e.key === "/" && e.target.tagName !== "INPUT") {
        e.preventDefault();
        document.getElementById("search").focus();
      }
      if (e.key === "f" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        document.getElementById("search").focus();
      }
    });

    // Interactive Git Graph
    const graphButtons = document.querySelectorAll(".graph-btn");
    const graphDesc = document.getElementById("graph-desc");
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.getElementById("git-graph");

    // Initial state: single commit on main branch
    const initialState = {
      commits: [
        { id: "c0", x: 100, y: 100, branch: "main", color: "#10b981" },
      ],
      branches: [], // no branches yet (only one commit)
      activeBranch: "main",
      nextCommitId: 1,
      featureBranchExists: false,
      merged: false,
      rebased: false,
    };

    let graphState = JSON.parse(JSON.stringify(initialState));

    // Update SVG width based on furthest commit
    function updateSvgWidth() {
      const padding = 100;
      const maxX = graphState.commits.reduce((max, c) => Math.max(max, c.x), 0);
      const width = Math.max(800, maxX + padding);
      svg.setAttribute("width", width);
    }

    function updateGraph() {
      // Clear existing elements
      while (svg.children.length > 0) {
        svg.removeChild(svg.firstChild);
      }

      // Draw branches
      graphState.branches.forEach(branch => {
        const from = graphState.commits.find(c => c.id === branch.from);
        const to = graphState.commits.find(c => c.id === branch.to);
        if (!from || !to) return;
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", from.x);
        line.setAttribute("y1", from.y);
        line.setAttribute("x2", to.x);
        line.setAttribute("y2", to.y);
        line.setAttribute("stroke", branch.color);
        line.setAttribute("stroke-width", "2");
        if (branch.dash) {
          line.setAttribute("stroke-dasharray", "5,5");
        }
        svg.appendChild(line);
      });

      // Draw commits
      graphState.commits.forEach(commit => {
        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", commit.x);
        circle.setAttribute("cy", commit.y);
        circle.setAttribute("r", "15");
        circle.setAttribute("fill", commit.color);
        svg.appendChild(circle);

        // Label
        const label = document.createElementNS(svgNS, "text");
        label.setAttribute("x", commit.x);
        label.setAttribute("y", commit.y + 30);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("fill", "var(--text)");
        label.setAttribute("font-size", "14");
        label.textContent = commit.id === "c0" ? "main" : commit.id;
        svg.appendChild(label);
      });

      // Update SVG width for scrolling
      updateSvgWidth();
    }

    function handleGraphCommand(cmd) {
      const descs = {
        commit: "Added a new commit to the current branch.",
        branch: "Created a new branch 'feature' from the current commit.",
        checkout: "Switched to the 'feature' branch. New commits will appear on this branch.",
        merge: "Merged 'feature' into 'main'. The feature branch is now integrated.",
        rebase: "Rebased 'feature' onto 'main'. The feature branch now has a linear history.",
        reset: "Reset the graph to its initial state."
      };
      graphDesc.textContent = descs[cmd] || "Click a command to see how it changes the graph.";

      if (cmd === "reset") {
        graphState = JSON.parse(JSON.stringify(initialState));
        updateGraph();
        return;
      }

      if (cmd === "commit") {
        const lastCommit = graphState.commits.filter(c => c.branch === graphState.activeBranch).slice(-1)[0];
        const newId = "c" + graphState.nextCommitId;
        const newCommit = {
          id: newId,
          x: lastCommit.x + 200,
          y: lastCommit.y,
          branch: graphState.activeBranch,
          color: graphState.activeBranch === "main" ? "#10b981" : "#ef4444"
        };
        graphState.commits.push(newCommit);
        graphState.branches.push({ from: lastCommit.id, to: newId, color: newCommit.color });
        graphState.nextCommitId++;
      }

      if (cmd === "branch") {
        if (!graphState.featureBranchExists) {
          const lastCommit = graphState.commits.filter(c => c.branch === "main").slice(-1)[0];
          const newId = "c" + graphState.nextCommitId;
          const newCommit = {
            id: newId,
            x: lastCommit.x + 200,
            y: lastCommit.y - 50,
            branch: "feature",
            color: "#ef4444"
          };
          graphState.commits.push(newCommit);
          graphState.branches.push({ from: lastCommit.id, to: newId, color: newCommit.color });
          graphState.nextCommitId++;
          graphState.featureBranchExists = true;
        }
      }

      if (cmd === "checkout") {
        if (graphState.featureBranchExists) {
          graphState.activeBranch = "feature";
        }
      }

      if (cmd === "merge") {
        if (!graphState.merged && graphState.featureBranchExists) {
          const lastMain = graphState.commits.filter(c => c.branch === "main").slice(-1)[0];
          const lastFeature = graphState.commits.filter(c => c.branch === "feature").slice(-1)[0];
          if (lastMain && lastFeature) {
            graphState.branches.push({ from: lastMain.id, to: lastFeature.id, color: "#8b5cf6", dash: true });
            graphState.merged = true;
          }
        }
      }

      if (cmd === "rebase") {
        if (!graphState.rebased && graphState.featureBranchExists) {
          // Move feature commits to be on top of main (simplified)
          const featureCommits = graphState.commits.filter(c => c.branch === "feature");
          const lastMain = graphState.commits.filter(c => c.branch === "main").slice(-1)[0];
          let offsetX = lastMain.x + 200;
          featureCommits.forEach(fc => {
            fc.x = offsetX;
            fc.y = lastMain.y;
            offsetX += 200;
          });
          graphState.rebased = true;
        }
      }

      updateGraph();
    }

    graphButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const cmd = btn.dataset.cmd;
        handleGraphCommand(cmd);
      });
    });

    // Initialize graph
    updateGraph();
