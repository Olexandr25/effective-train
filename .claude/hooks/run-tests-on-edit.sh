#!/bin/bash
# PostToolUse hook: after any Edit/Write inside src/, run the test suite so
# breakage is caught immediately instead of surfacing later at `npm run validate`.

payload="$(cat)"
tool_name="$(echo "$payload" | jq -r '.tool_name // empty')"

case "$tool_name" in
  Edit|Write|MultiEdit) ;;
  *) exit 0 ;;
esac

file_path="$(echo "$payload" | jq -r '.tool_input.file_path // empty')"
rel_path="${file_path#"$CLAUDE_PROJECT_DIR"/}"

case "$rel_path" in
  src/*) ;;
  *) exit 0 ;;
esac

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
output="$(npx vitest run tests/ src/ 2>&1)"
status=$?

if [ "$status" -ne 0 ]; then
  echo "Tests failed after editing $rel_path:" >&2
  echo "$output" | tail -40 >&2
  exit 2
fi

exit 0
