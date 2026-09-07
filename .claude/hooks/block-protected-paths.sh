#!/bin/bash
# PreToolUse hook: block edits to public/api/ (data contracts other panels
# depend on) and RUBRIC.md (the grading rubric). Per CLAUDE.md's deletion
# policy, these need a human in the loop, not an agent edit.

payload="$(cat)"
tool_name="$(echo "$payload" | jq -r '.tool_name // empty')"

case "$tool_name" in
  Edit|Write|MultiEdit) ;;
  *) exit 0 ;;
esac

file_path="$(echo "$payload" | jq -r '.tool_input.file_path // empty')"
rel_path="${file_path#"$CLAUDE_PROJECT_DIR"/}"

if [[ "$rel_path" == public/api/* || "$rel_path" == "RUBRIC.md" ]]; then
  echo "Blocked: '$rel_path' is a locked path (public/api/* is a shared data contract, RUBRIC.md is the grading rubric). Ask the user before touching it." >&2
  exit 2
fi

exit 0
