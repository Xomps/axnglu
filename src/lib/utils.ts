import { appendFileSync, readFileSync, accessSync, constants, unlinkSync, statSync, createReadStream, createWriteStream } from 'fs'

export const parseSize = (input: string | number): number => {
  if (typeof input === 'number') {
    return input
  }
  const string = input.toLowerCase().trim()
  let bytes = parseFloat(string)
  if (string.endsWith('kb')) {
    bytes *= 1024
  } else if (string.endsWith('mb')) {
    bytes *= 1024 * 1024
  } else if (string.endsWith('gb')) {
    bytes *= 1024 * 1024 * 1024
  }
  return Math.ceil(bytes)
}

export const writePart = (filePath: string, partInfo: { filePath: string; start: number; end: number; }): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = createReadStream(filePath, {
      encoding: undefined,
      start: partInfo.start,
      end: partInfo.end
    })
    const writer = createWriteStream(partInfo.filePath)
    const pipe = reader.pipe(writer)

    pipe.on('error', error => reject(error))
    pipe.on('finish', () => resolve(partInfo.filePath))
  })
}

export const removeFile = (filePath: string) => {
  unlinkSync(filePath)
}

export const getFileSize = (filePath: string): number => {
  const { isFile, size } = statSync(filePath)
  if (!isFile) throw new Error(`Error: "${filePath}" is not a valid file`)
  return size
}

export const findParts = (filePath: string): string[] => {
  const files: string[] = []
  const filename = filePath.replace(/\.\d{3}$/, '')
  let counter = 1

  while (true) {
    const name = `${filename}.${(counter++).toString().padStart(3, '0')}`
    if (exists(name)) {
      files.push(name)
    } else {
      break
    }
  }

  return files
}

export const joinFragments = (fragments: string[], outFilePath: string) => {
  for (const filePath of fragments) {
    appendFileSync(outFilePath, readFileSync(filePath))
  }
}

export const exists = (file: string): boolean => {
  try {
    accessSync(file, constants.R_OK)
  } catch {
    return false
  }
  return true
}

export const isFragment = (file: string): boolean => {
  return /\d{3}$/.test(file)
}
