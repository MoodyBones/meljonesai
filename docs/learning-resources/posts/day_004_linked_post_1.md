# Technical Deep Dive: Debugging CI/CD Native Module Failures
## Why Builds Fail in CI But Work Locally

**Date:** 2025-11-19
**Session:** Day 004 - CI/CD Debugging
**Topic:** Native Module Dependencies in GitHub Actions

---

## The Problem We Solved

The build was failing in GitHub Actions with a cryptic error:

```
Error: Cannot find module '../lightningcss.linux-x64-gnu.node'
```

Yet locally, everything worked perfectly. The same code, the same `package.json`, the same `package-lock.json`—but CI failed consistently while local builds succeeded.

This is a classic "works on my machine" problem, but with a twist: the solution reveals important truths about how modern JavaScript tooling handles platform-specific binaries.

---

## Understanding Optional Dependencies

Modern frontend tooling like Tailwind CSS v4 and `lightningcss` use **native Rust binaries** for performance. These aren't JavaScript—they're compiled machine code that runs 10-100x faster than equivalent JS.

But here's the catch: compiled binaries are platform-specific.

**The package.json shows:**

```json
{
  "dependencies": {
    "lightningcss": "^1.30.2",
    "@tailwindcss/oxide": "^4.1.16"
  }
}
```

But these packages don't contain the actual binaries. Instead, they declare **optional dependencies**:

```json
{
  "optionalDependencies": {
    "lightningcss-darwin-arm64": "1.30.2",        // macOS M1/M2
    "lightningcss-linux-x64-gnu": "1.30.2",       // Linux x64
    "lightningcss-win32-x64-msvc": "1.30.2",      // Windows x64
    "@tailwindcss/oxide-darwin-arm64": "4.1.16",  // macOS M1/M2
    "@tailwindcss/oxide-linux-x64-gnu": "4.1.16", // Linux x64
    // ...etc
  }
}
```

npm's algorithm during installation:
1. Detect platform (darwin, linux, win32)
2. Detect architecture (arm64, x64)
3. Try to install matching optional dependency
4. **If it fails, continue anyway** (that's what "optional" means)

---

## Why This Failed in CI

### Local (macOS M1):

```bash
npm install
# → Installs lightningcss-darwin-arm64 ✅
# → Binary available at node_modules/lightningcss-darwin-arm64/lightningcss.darwin-arm64.node
# → lightningcss package can find it
# → Build succeeds
```

### GitHub Actions (ubuntu-latest):

```bash
npm ci
# → Tries to install lightningcss-linux-x64-gnu
# → Network hiccup / npm bug / registry issue
# → Install fails silently (it's optional!)
# → lightningcss package CAN'T find the binary
# → Build fails: "Cannot find module '../lightningcss.linux-x64-gnu.node'"
```

The key insight: **optional dependencies can fail silently**. npm considers it acceptable to skip them. This is by design—it allows packages to work without native acceleration on unsupported platforms.

But for packages like `lightningcss` and `@tailwindcss/oxide`, the native binary isn't optional—it's **required**. The package architecture assumes it will be there.

---

## The Solution: Explicit Installation

Instead of trusting npm to install optional dependencies correctly, we explicitly install them in CI:

```yaml
# .github/workflows/web-ci.yml
- name: Install native modules for Linux
  run: |
    npm install --no-save lightningcss-linux-x64-gnu@1.30.2 @tailwindcss/oxide-linux-x64-gnu@4.1.16
```

**Why this works:**

1. **Explicit > Implicit**
   - We're not relying on npm's optional dependency algorithm
   - We explicitly request the Linux binary
   - If it fails, the CI build fails (not silent)

2. **Version Pinning**
   - `@1.30.2` matches the parent package version
   - Ensures compatibility
   - Prevents version mismatch bugs

3. **--no-save Flag**
   - Doesn't modify `package.json` or `package-lock.json`
   - Keeps them clean and portable
   - CI-specific installation, not committed

4. **Post npm ci**
   - Runs after `npm ci` completes
   - Installs into existing `node_modules`
   - Doesn't conflict with lockfile

---

## Why We Don't Rebuild from Source

You might think: "Why not just rebuild from source using Rust?"

Previous attempt:

```yaml
- name: Install Rust toolchain
  uses: dtolnay/rust-toolchain@stable

- name: Rebuild native modules
  run: npm rebuild lightningcss --build-from-source
```

**This failed because:**

1. **lightningcss doesn't support npm rebuild**
   - It's not designed to build from source via npm
   - The build system expects pre-built binaries
   - No `binding.gyp` or Cargo integration

2. **Time Cost**
   - Compiling Rust from source: 5-10 minutes
   - Downloading pre-built binary: 5 seconds
   - 60-120x slower

3. **Complexity**
   - Requires Rust toolchain in CI
   - Additional dependencies
   - More failure modes

**Pre-built binaries are the correct approach.**

---

## The Broader Pattern: Optional Dependencies in Modern JS

This pattern appears in many modern packages:

**Performance-critical tools:**
- `esbuild` - Go-based bundler
- `swc` - Rust-based compiler
- `lightningcss` - Rust-based CSS processor
- `@tailwindcss/oxide` - Rust-based Tailwind compiler

**System integrations:**
- `sharp` - C++ image processing
- `sqlite3` - C++ database bindings
- `canvas` - C++ Canvas API

**Why native bindings:**
- 10-100x performance improvement
- Access to system APIs
- Leverage existing C/C++/Rust libraries

**The trade-off:**
- Platform-specific binaries
- Optional dependency complexity
- CI/CD configuration burden

---

## Best Practices for Native Modules in CI

### 1. Document Which Packages Need Special Handling

In `.github/copilot-instructions.md`:

```markdown
### Current Dependencies Requiring Native Modules

- `lightningcss@1.30.2` → `lightningcss-linux-x64-gnu@1.30.2`
- `@tailwindcss/oxide@4.1.16` → `@tailwindcss/oxide-linux-x64-gnu@4.1.16`

Update CI workflow if versions change.
```

### 2. Install After npm ci, Not Before

```yaml
# ✅ Correct order
- run: npm ci
- run: npm install --no-save lightningcss-linux-x64-gnu@1.30.2
- run: npm run build

# ❌ Wrong order
- run: npm install --no-save lightningcss-linux-x64-gnu@1.30.2
- run: npm ci  # This removes it!
- run: npm run build
```

### 3. Verify Installation

```yaml
- name: Install native modules
  run: |
    npm install --no-save lightningcss-linux-x64-gnu@1.30.2
    # Verify it worked
    ls -la node_modules/lightningcss-linux-x64-gnu/ || echo "Failed to install"
```

### 4. Test Module Loading

```yaml
- name: Verify modules load
  run: |
    node -e "require('lightningcss'); console.log('✓ lightningcss loaded')"
    node -e "require('@tailwindcss/oxide'); console.log('✓ oxide loaded')"
```

---

## Debugging Native Module Issues

### Symptom 1: "Cannot find module" Error

```
Error: Cannot find module '../lightningcss.linux-x64-gnu.node'
```

**Diagnosis:**
- Optional dependency not installed
- Wrong platform binary

**Fix:**
- Explicitly install platform-specific package
- Check platform detection: `node -p "process.platform"`

### Symptom 2: "Module did not self-register"

```
Error: Module did not self-register
```

**Diagnosis:**
- Node version mismatch
- Binary compiled for different Node.js version

**Fix:**
- Match Node.js version between local and CI
- Rebuild native modules if needed

### Symptom 3: "Unsupported platform"

```
Error: Unsupported platform: linux-arm64
```

**Diagnosis:**
- Package doesn't provide binary for that platform

**Fix:**
- Use different package
- Fall back to non-native implementation
- Compile from source (if supported)

---

## Key Takeaways

1. **Optional dependencies can fail silently**
   - Don't trust npm to install them
   - Explicitly install critical optional deps in CI

2. **Pre-built binaries >> Building from source**
   - Faster (seconds vs. minutes)
   - Simpler (no toolchain required)
   - More reliable (fewer failure modes)

3. **Document native module dependencies**
   - Which packages require special handling
   - Exact versions to install
   - Platform-specific package names

4. **Verify installation in CI**
   - Check files exist
   - Test module loading
   - Fail loudly if missing

5. **Match Node.js versions**
   - Local and CI should use same version
   - Use `.nvmrc` or `package.json#engines`

---

## Further Reading

- [npm Optional Dependencies Docs](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#optionaldependencies)
- [Node.js Native Addons](https://nodejs.org/api/addons.html)
- [lightningcss on npm](https://www.npmjs.com/package/lightningcss)
- [Tailwind CSS v4 Alpha Docs](https://tailwindcss.com/docs/v4-alpha)

---

**Written:** 2025-11-19
**Session:** Day 004 - CI/CD Debugging
**Next Review:** 2025-11-20
