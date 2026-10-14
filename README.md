# Python Bool Icons

A Visual Studio Code extension that decorates Boolean variables in Python with Morgan Freeman. It is also compatible with JupyterLab (tried and true baby).

## Features

- Displays a magnificent icon for Python Boolean variables (`True` and `False`).
- Works in Python source files and JupyterLab notebooks and maybe something else.

## Screenshot

![Screenshot](images_old/screenshot.png)

## How 2 Install

### Option 1: Install from release

1. Go to the [Releases page](https://github.com/choom1984/TrueMeme/releases) and download the latest `.vsix` file.
2. Open VS Code and go to the Extensions view (`Ctrl+Shift+X`, or `Cmd+Shift+X` on Mac).
3. Click the **⋯** menu at the top of the Extensions view and choose **Install from VSIX…**.
4. Select the `.vsix` file you downloaded.
5. Reload VS Code if prompted.


### Option 2: Build from source

Requires [Node.js](https://nodejs.org/) and [Git](https://git-scm.com/).

```
git clone https://github.com/choom1984/TrueMeme.git
cd TrueMeme
npx @vscode/vsce package
code --install-extension TrueMeme-0.0.1.vsix
```

### Using your own maymays

Open Settings (`Ctrl+,`), search for **Python Bool Icons**, and set **True Icon** and **False Icon** to the full paths of your image files. **Icon Size** should control how large they appear (default `1em`) but doesn't really work so resize the image to 32x32 px before setting it.