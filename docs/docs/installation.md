### Building from Source

`ts-run` is currently in active development and must be built from the source code. It is not yet available as a pre-compiled package on the npm registry.

#### 1. Clone the Repository

Begin by cloning the project to your local machine:

```bash
git clone https://github.com/vss-co/ts-run.git
cd ts-run

```

#### 2. Install Dependencies

Install the required development tools and libraries:

```bash
npm install

```

#### 3. Compile the Project

The project must be transpiled from TypeScript into JavaScript before the CLI can be executed. This populates the `dist/` directory:

```bash
npm run build

```

#### 4. Link the Binary (Optional)

To use the `ts-run` command globally on your system without navigating to the project folder, use the link command:

```bash
npm link

```

*Note: This creates a symbolic link between your project folder and the system's global node_modules.*