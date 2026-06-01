# README Generator Prompt

Generate (or refresh) a comprehensive README.md for this repository by analyzing the canonical documentation sources. Follow these steps:

1. Read the real documentation sources, in priority order:
    - `AGENTS.md` (root) — single source of truth for stack, principles, rules, commands, structure
    - `.github/instructions/architecture-guide.instructions.md` — architecture, wiring, structure
    - `.github/instructions/coding-standards.instructions.md` — formatting, naming, TypeScript rules
    - `.github/instructions/patterns.instructions.md` — copy-paste recipes and conventions
    - `exemplars.md` — pointers to high-quality real examples in this repo
    - `package.json` — name, scripts, dependencies, and versions

2. Update the existing README.md (create it if absent) with the following sections:

## Project Name and Description

- Extract the project name and primary purpose from `AGENTS.md` and `package.json`
- Include a concise description of what the project does

## Technology Stack

- List the primary technologies, languages, and frameworks used
- Include version information when available
- Source this information primarily from the tech-stack table in `AGENTS.md` and `package.json`

## Project Architecture

- Provide a high-level overview of the architecture
- Consider including a simple diagram if described in the documentation
- Source from `.github/instructions/architecture-guide.instructions.md`

## Getting Started

- Include installation instructions based on the technology stack
- Add setup and configuration steps
- Include any prerequisites

## Project Structure

- Brief overview of the folder organization
- Source from the project-structure section of `AGENTS.md` and the architecture guide

## Key Features

- List main functionality and features of the project
- Extract from `AGENTS.md` and the instruction docs

## Development Workflow

- Summarize the development process
- Include the relevant commands from `AGENTS.md` / `package.json` scripts
- Include information about branching strategy if available

## Coding Standards

- Summarize key coding standards and conventions
- Source from `.github/instructions/coding-standards.instructions.md`

## Testing

- Explain testing approach and tools
- Source from the testing section of `AGENTS.md` and `.github/instructions/patterns.instructions.md`

## Contributing

- Guidelines for contributing to the project
- Reference any code exemplars for guidance
- Source from `exemplars.md` and `AGENTS.md`

## License

- Include license information if available

Format the README with proper Markdown, including:

- Clear headings and subheadings
- Code blocks where appropriate
- Lists for better readability
- Links to other documentation files
- Badges for build status, version, etc. if information is available

Keep the README concise yet informative, focusing on what new developers or users would need to know about the project.
