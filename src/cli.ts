#!/usr/bin/env node
import prompts from 'prompts'
import ora = require('ora')
import parse from 'minimist'
import { splitByParts, splitBySize, join } from './'
import { exists } from './lib/utils'

const start = async () => {
  const prog = ora()

  const args = parse<Options>(process.argv, {
    alias: {
      interactive: ['i'],
      fragments: ['f', 'parts', 'p'],
      size: ['s'],
      removeOriginal: ['R', 'clean', 'D'],
      help: ['h']
    }
  })

  if (args.help) {
    console.log(`
Usage:
  $ axnglu <command> <file> <options>
  $ axnglu [--interactive, -i]
  $ axnglu <file>
  $ axnglu

Commands:
  split, s, axe, ax     Split the given filen by number of parts or size of each part.
  join, j, glue, glu    Finds the corresponding fragments of the given file and joins them.

Options:
  --size, -s            (String) Size of each file fragment.
  --parts, -p,
  --fragments, -f       (Number) Number of fragments/parts.
  --clean, -R, -D       Remove original file(s).
  --help, -h            Displays tool info.

Examples:
  axnglu split "big-file.zip" --size 250mb
  axnglu axe "big-file.zip" -s 4.37gb -D
  axnglu s "big-file.zip" --fragments 5
  axnglu join "big-file.zip.001"
  axnglu j "big-file.zip.001"
  axnglu glue "big-file.zip.001" --clean

    `)
    return
  }

  const [, , command, filename] = args._
  let file

  const commandIsFilename = exists(command)
  if (commandIsFilename) file = command

  if (args.interactive || (!command && !filename) || (commandIsFilename && !filename)) {
    const command = await promptSelect('Command:', [
      { title: 'Split', value: 'split' },
      { title: 'Join', value: 'join' }
    ])

    const filename = await promptText('Filename:', { initial: file })
    if (!exists(filename)) {
      prog.fail('Input file does not exist')
      return
    }

    if (command === 'split') {
      const method = await promptSelect('Command:', [
        { title: 'Fragment Number', value: 'fragments' },
        { title: 'Fragment Size', value: 'size' }
      ])
      if (method === 'fragments') {
        const fragments = await promptNumber('Number of Fragments:', { min: 2, max: 999, initial: 2 })
        const removeOriginal = await promptToggle('Remove original file?', false)
        try {
          prog.start(`Splitting file into ${fragments} Fragments`)
          await splitByParts(filename, fragments, removeOriginal)
          prog.succeed('File split successfully')
        } catch (e) {
          prog.fail(e.message)
        }
        return
      }
      if (method === 'size') {
        const size = await promptText('Size of each Fragment:')
        const removeOriginal = await promptToggle('Remove original file?', false)
        try {
          prog.start(`Splitting file in Fragments of ${size}`)
          await splitBySize(filename, size, removeOriginal)
          prog.succeed('File split successfully')
        } catch (e) {
          prog.fail(e.message)
        }
        return
      }
    }
    if (command === 'join') {
      const removefragments = await promptToggle('Remove original fragments?', false)
      try {
        prog.start(`Joining files...`)
        await join(filename, removefragments)
        prog.succeed('Files joined successfully')
      } catch (e) {
        prog.fail(e.message)
      }
      return
    }
    return
  }

  if (!isJoinCommand(command) && !isSplitCommand(command)) {
    prog.fail(`Invalid Filename or Command: ${command}`)
    return
  }
  if (!filename) {
    prog.fail(`Filename "${filename}" not supplied`)
    return
  }

  if (isSplitCommand(command)) {
    const { fragments, size, removeOriginal } = args
    if (fragments) {
      try {
        prog.start(`Splitting file into ${fragments} Fragments`)
        await splitByParts(filename, fragments, removeOriginal)
        prog.succeed('File split successfully')
      } catch (e) {
        prog.fail(e.message)
      }
      return
    }
    if (size) {
      try {
        prog.start(`Splitting file in Fragments of ${size}`)
        await splitBySize(filename, size, removeOriginal)
        prog.succeed('File split successfully')
      } catch (e) {
        prog.fail(e.message)
      }
      return
    }
  }

  if (isJoinCommand(command)) {
    const { removeOriginal } = args
    try {
      prog.start(`Joining files...`)
      await join(filename, removeOriginal)
      prog.succeed('Files joined successfully')
    } catch (e) {
      prog.fail(e.message)
    }
    return
  }
}

const isSplitCommand = (command: string) =>
  command === 'split' || command === 's' || command === 'axe' || command === 'ax'

const isJoinCommand = (command: string) =>
  command === 'join' || command === 'j' || command === 'glu' || command === 'glue'

interface Options {
  split: boolean
  join: boolean
  size: string
  fragments: number
  removeOriginal: boolean
  interactive: boolean
  help: boolean
  version: boolean
}

const promptText = (message: string, { initial = '' }: { initial?: string } = {}): Promise<string> => {
  return prompts({
    type: 'text',
    name: 'value',
    message,
    initial
  }).then(o => o.value)
}

const promptNumber = (message: string, { min = 0, max = Infinity, initial }: { min?: number, max?: number, initial?: number }): Promise<number> => {
  return prompts({
    type: 'number',
    name: 'value',
    message,
    min,
    max,
    initial
  }).then(o => o.value)
}

const promptSelect = (message: string, choices: Array<{ title: string, value: any }>, initial = 0) => {
  return prompts({
    type: 'select',
    name: 'value',
    message,
    choices,
    initial
  }).then(o => o.value)
}

const promptToggle = (message: string, initial = false) => {
  return prompts({
    type: 'toggle',
    name: 'value',
    message,
    initial,
    active: 'yes',
    inactive: 'no'
  }).then(o => o.value)
}

start()
