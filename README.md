# Mint <img width="22pt" src="./logo/logo_128x128.png"></img>

A JavaScript library for creating interactive mathematical visualizations.

### Build from Source

To build locally, run the following commands

```bash
git clone git@github.com:djbarker/mint.git
cd mint/
npm install typescript
make lib
```

This will place the relevant files under the `dist/` directory.
You can then import from `dist/mint.js`, for example:

```javascript
import { vec2 } from "path/to/dist/mint.js";
```

### Examples

Some examples can be found under [`examples/`](examples/).