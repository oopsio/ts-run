


### Development Workflow

Since the tool is built from source, your local development cycle should follow this pattern:

1. **Modify**: Edit files in the `src/` directory.
2. **Build**: Run `npm run build` to update the `dist/` folder.
3. **Test**: Run `npm test` to verify your changes.

### Troubleshooting the Build

If you encounter an `ERR_MODULE_NOT_FOUND` error during execution or testing, it is likely because the `dist/` folder is out of sync with the `src/` folder. Always ensure a fresh build is generated after modifying the CLI or Runner logic.

```bash
# Clean and rebuild if you see module resolution errors
rm -rf dist
npm run build

```