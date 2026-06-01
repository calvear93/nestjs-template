---
mode: agent
description: 'Create an llms.txt file from scratch based on repository structure following the llms.txt specification at https://llmstxt.org/'
tools:
    [
        'changes',
        'codebase',
        'editFiles',
        'extensions',
        'fetch',
        'githubRepo',
        'openSimpleBrowser',
        'problems',
        'runTasks',
        'search',
        'searchResults',
        'terminalLastCommand',
        'terminalSelection',
        'testFailure',
        'usages',
        'vscodeAPI',
    ]
---

Follow the procedure in [`.ai/prompts/create-llms.md`](../../.ai/prompts/create-llms.md).
