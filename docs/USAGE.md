# Install Bridge — Usage Guide

This guide shows you how to create install badges that you can embed on any website or README file.

---

## Quick Start (Recommended)

The fastest way to create your install badge:

```bash
install-bridge setup YourApp
```

This single command:
1. Detects your GitHub repository
2. Creates `install-bridge.json` with your repo URLs
3. Generates your badge as `install-badge.svg`
4. Shows you the embed snippet to copy

**What happens:**
- If you're in a git repository with a GitHub remote, it auto-detects your repo info
- URLs are automatically populated (e.g., `https://github.com/user/repo/releases/...`)
- Badge is generated immediately with sensible defaults

---

## Step-by-Step Workflow

If you prefer more control or need to customize before generating:

### 1. Initialize Configuration

```bash
install-bridge init MyApp
```

This creates `install-bridge.json` with:
- Auto-detected repository URLs (if in a git repo)
- Placeholder URLs (if not in a git repo)
- Default badge styling

**Example output:**
```
Info: Created install-bridge.json

Info: Detected GitHub repository: user/repo
      URLs have been auto-populated with your repository info.

Note: Next steps:
      1. Review and edit install-bridge.json as needed
      2. Update installer URLs to match your release assets
      3. Run: install-bridge generate
```

### 2. Customize Your Configuration (Optional)

Edit `install-bridge.json` to:
- Update installer URLs to match your actual release assets
- Customize badge colors, labels, or style
- Add or remove platform support

```json
{
  "name": "MyApp",
  "installers": {
    "darwin": "https://github.com/user/repo/releases/latest/download/MyApp-macOS.dmg",
    "win32": "https://github.com/user/repo/releases/latest/download/MyApp-windows.exe",
    "linux": "https://github.com/user/repo/releases/latest/download/MyApp-linux.AppImage"
  },
  "homepage": "https://github.com/user/repo",
  "fallback": "https://github.com/user/repo/releases",
  "badge": {
    "label": "Install",
    "color": "#0366d6",
    "style": "flat"
  }
}
```

### 3. Validate Configuration (Optional)

```bash
install-bridge validate
```

Checks your configuration for errors before generating.

### 4. Generate Badge

```bash
install-bridge generate
```

Creates `install-badge.svg` and displays embed snippets.

**Example output:**
```
Info: Generated install-badge.svg

--- Markdown ---

[![Install MyApp](./install-badge.svg)](https://github.com/user/repo)

--- HTML ---

<a href="https://github.com/user/repo">
  <img src="./install-badge.svg" alt="Install MyApp" />
</a>

Note: Copy the snippet above and paste it into your README.md or any website

Info: Badge file created: install-badge.svg
      Commit this file to your repository to use the badge.
```

---

## Complete Command Reference

```bash
# One-step setup (recommended)
install-bridge setup [AppName]

# Step-by-step commands
install-bridge init [AppName]    # Create configuration
install-bridge validate          # Check configuration
install-bridge generate          # Create badge and snippets

# Get help
install-bridge                   # Show usage information
```

---

## Real-World Example

Let's say you have a GitHub repository at `github.com/johndoe/awesome-tool`:

```bash
cd /path/to/awesome-tool
install-bridge setup AwesomeTool
```

**Result:**
- `install-bridge.json` created with:
  ```json
  {
    "name": "AwesomeTool",
    "installers": {
      "darwin": "https://github.com/johndoe/awesome-tool/releases/latest/download/AwesomeTool-macOS.dmg",
      "win32": "https://github.com/johndoe/awesome-tool/releases/latest/download/AwesomeTool-windows.exe",
      "linux": "https://github.com/johndoe/awesome-tool/releases/latest/download/AwesomeTool-linux.AppImage"
    },
    "homepage": "https://github.com/johndoe/awesome-tool",
    "fallback": "https://github.com/johndoe/awesome-tool/releases",
    "badge": {
      "label": "Install",
      "color": "#0366d6",
      "style": "flat"
    }
  }
  ```

- `install-badge.svg` generated
- Ready-to-paste Markdown snippet:
  ```markdown
  [![Install AwesomeTool](./install-badge.svg)](https://github.com/johndoe/awesome-tool)
  ```

**Now just:**
1. Update the installer URLs to match your actual release asset names
2. Commit both files (`install-bridge.json` and `install-badge.svg`)
3. Paste the Markdown snippet in your README.md

Setup complete.

---

## Tips

### Auto-Detection Works Best With:
- Repositories with GitHub remotes
- Standard repository naming conventions
- When run from the repository root

### Without Git Repository:
If you're not in a git repository, Install Bridge creates a template with placeholder URLs:
```bash
install-bridge init MyApp
# Edit install-bridge.json to replace placeholder URLs
install-bridge generate
```

### Customizing Badge Appearance:
Edit the `badge` section in `install-bridge.json`:

```json
{
  "badge": {
    "label": "Download",        // Custom label
    "color": "#ff6b6b",         // Custom color (hex)
    "style": "flat"             // flat or simple
  }
}
```

### Multiple Platforms:
You don't need to support all platforms. Just include the ones you have:

```json
{
  "installers": {
    "darwin": "https://...",
    "linux": "https://..."
    // win32 omitted - that's fine!
  }
}
```

---

## Common Workflows

### Scenario 1: New GitHub Project
```bash
cd my-project
install-bridge setup MyProject
# Edit install-bridge.json to match your release assets
git add install-bridge.json install-badge.svg
git commit -m "Add install badge"
```

### Scenario 2: Existing Project
```bash
cd existing-project
install-bridge setup
# Auto-detects project name from directory
# Edit and commit as needed
```

### Scenario 3: Non-GitHub Project
```bash
install-bridge init MyApp
# Edit install-bridge.json with your custom URLs
install-bridge validate
install-bridge generate
```

---

## Troubleshooting

### "Missing install-bridge.json"
Run `install-bridge init` or `install-bridge setup` first.

### "Invalid config"
Run `install-bridge validate` to see specific errors.
Check that:
- All URLs are valid HTTPS URLs
- At least one platform is specified
- Required fields (`name`, `installers`) are present

### Badge Not Displaying
Make sure:
- `install-badge.svg` is committed to your repository
- The path in your Markdown matches the file location
- The file is accessible in your repository

---

## Next Steps

- See [CONFIG_AND_STABILITY.md](./CONFIG_AND_STABILITY.md) for detailed configuration reference
- See [ARCHITECTURE.md](./ARCHITECTURE.md) to understand how Install Bridge works
- Visit the [main repository](https://github.com/dfeen87/install-bridge) for more examples
