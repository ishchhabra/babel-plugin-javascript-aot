# babel-plugin-javascript-aot

A Babel plugin that performs Ahead-of-Time (AOT) compilation to optimize JavaScript code at build time.

> [!IMPORTANT]
> This project is currently under development and not production-ready.

## Why?

This project exists primarily as a learning exercise.

## Installation

```bash
pnpm add -D babel-plugin-javascript-aot
```

## Usage

In your `.babelrc` or Babel configuration:

```json
{
  "plugins": ["javascript-aot"]
}
```

## Development

```bash
# Setup
pnpm install

# Development
pnpm build    # Build the plugin
pnpm test     # Run tests
pnpm lint     # Check code style
```
