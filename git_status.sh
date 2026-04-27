#!/bin/bash
cd "$(dirname "$0")"

show_status() {
  echo ""
  echo "========================================"
  echo "  Git Status — $(basename "$PWD")"
  echo "========================================"
  git status
  echo ""
  echo "========================================"
  echo "  Recent Commits"
  echo "========================================"
  git log --oneline -10
  echo ""
  echo "========================================"
  echo "  Actions"
  echo "========================================"
  echo "  1) stage a file"
  echo "  2) stage all changes"
  echo "  3) commit staged changes"
  echo "  4) show unstaged diff"
  echo "  5) show staged diff"
  echo "  6) restore (discard) a file"
  echo "  7) push  (main + master)"
  echo "  8) pull"
  echo "  9) custom git command"
  echo "  s) refresh"
  echo "  0) exit"
  echo ""
}

do_push() {
  echo "→ Pushing to origin/main..."
  git push origin main
  echo "→ Syncing origin/master..."
  git push --force origin main:master
  echo "✓ Both main and master updated"
}

show_status

while true; do
  read -rp "Choose [0-9/s]: " choice

  case "$choice" in
    1)
      read -rp "File to stage: " f
      git add "$f" && echo "✓ Staged: $f"
      ;;
    2)
      git add .
      echo "✓ All changes staged"
      ;;
    3)
      read -rp "Commit message: " msg
      git commit -m "$msg"
      ;;
    4)
      git diff
      ;;
    5)
      git diff --staged
      ;;
    6)
      read -rp "File to restore: " f
      read -rp "Discard changes in '$f'? [y/N]: " confirm
      [[ "$confirm" =~ ^[Yy]$ ]] && git restore "$f" && echo "✓ Restored: $f"
      ;;
    7)
      do_push
      ;;
    8)
      git pull
      ;;
    9)
      read -rp "git " cmd
      git $cmd
      ;;
    s|S)
      show_status
      continue
      ;;
    0)
      echo "Bye!"
      exit 0
      ;;
    *)
      echo "Invalid choice"
      ;;
  esac

  echo ""
  read -rp "Press Enter to continue..."
  show_status
done
