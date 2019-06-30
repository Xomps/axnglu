# Ax'n'glu

> Utility to split and join files for easy storage or transfer.

```bash
$ axnglu split myFile.7z --size 200mb
$ axnglu join myFile.7z.001
```

## Install

```bash
npm install [-g, --save-dev] axnglu
```

## API
```typescript
import { splitBySize, splitByParts } from 'axnglu'

splitByParts (
  filePath: string,
  parts: number,
  deleteOriginalFile = false
) => Promise<string[]>

splitBySize (
  filePath: string,
  size: number | string,
  deleteOriginalFile = false
) => Promise<string[]>

join (
  filePath: string,
  deleteOriginalFile = false
) => Promise<string>

```
> The methos return a `Promise` that fulfills into the path(s) of the generated file(s).

> Please note that `size` can be the `number` of bytes, or a `string` with units (`'100mb'`, `'4.37gb'`, etc).

#### Examples

```javascript
import { splitBySize, splitByParts, join } from 'split-file.js'

// Split file in parts of 100MB
const fragmentsPaths = await splitBySize('path/to/my-large-file.7z', '100mb')

// Split the file into 7 fragments and delete the original file
const fragmentsPaths2 = await splitByParts('path/to/my-large-file-2.7z', 7, true)

// Join the fragments and remove them
const joinedFile = await join(fragmentsPaths[0], true)
```


## CLI

#### Install

```
$ npm install -g axnglu
```

#### Usage

```
$ axnglu <command> <file> <options>
$ axnglu [--interactive, -i]
$ axnglu <file>
$ axnglu


Commands:
  split, s, axe, ax     Split the given filen by number of parts or size of each part.
  join, j, glue, glu    Finds the corresponding fragments of the given file and joins them.


Options:
  --size, -s            (String) Size of each file fragment.
  --parts, -p           (Number) Number of fragments/parts.
  --fragments, -f       (Number) Number of fragments/parts.
  --clean, -R           Remove original file(s).
  --help, -h            Displays help


Examples:
  axnglu split big-file.zip --size 250mb
  axnglu axe big-file.zip -s 4.37gb -R
  axnglu s big-file.zip --fragments 5
  axnglu join big-file.zip.001
  axnglu j big-file.zip.001
  axnglu glue big-file.zip.001 --clean

```

## Contribution

Feel free to open an issue if you have any ideas or suggestions that could improve this tool.
