# Hooks Demo — Exercise 2

## PreToolUse blocking a protected-path edit

`.claude/hooks/block-protected-paths.sh` runs on every `Edit`/`Write`/`MultiEdit`
call. It reads the same JSON Claude Code sends on stdin, checks
`tool_input.file_path` against the locked paths (`public/api/*`, `RUBRIC.md`),
and exits `2` with a stderr message when one matches — which Claude Code
treats as "block this tool call."

Invoking the hook directly with the exact payload shape a real `Edit` call
on `public/api/station.json` would send:

```
$ echo '{"tool_name":"Edit","tool_input":{"file_path":"public/api/station.json"}}' \
    | .claude/hooks/block-protected-paths.sh
Blocked: 'public/api/station.json' is a locked path (public/api/* is a
shared data contract, RUBRIC.md is the grading rubric). Ask the user before
touching it.

$ echo $?
2
```

Same result for `RUBRIC.md`:

```
$ echo '{"tool_name":"Write","tool_input":{"file_path":"RUBRIC.md"}}' \
    | .claude/hooks/block-protected-paths.sh
Blocked: 'RUBRIC.md' is a locked path (public/api/* is a shared data
contract, RUBRIC.md is the grading rubric). Ask the user before touching it.

$ echo $?
2
```

An edit to an unprotected file (`src/config.ts`) exits `0` and is allowed
through, confirming the hook only blocks the two intended paths.

## Note on how this was captured

This session runs Claude through a sandboxed relay (`claude -p` is disabled
here), so the excerpt above is the hook script invoked directly with the
same stdin payload Claude Code's PreToolUse event sends, rather than a
pasted transcript from an interactive `claude` session. The blocking logic
is identical either way. If you run `claude` in this repo yourself and ask
it to edit `RUBRIC.md`, you should see it report the tool call was denied
with this same message.
