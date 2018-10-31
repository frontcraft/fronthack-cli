'use strict'

const shell = require('shelljs')
const fs = require('fs-extra')
const ncp = require('ncp').ncp
const highlight = require('cli-highlight').highlight

const consoleColors = require('./consoleColors')
const generateSassComponent = require('./generateSassComponent')
const addImportToApp = require('./addImportToApp')


/**
 * Imports data about Bit component using yarn instead of a Bit CLI, then makes
 * usage of that, then removes it from node_modules
 * @argument {string} projectRoot root path of the current project
 * @argument {string} type can be 'component', 'layout' or 'global'
 * @argument {string} machinename unique name identifier of the component
 * @argument {string} description optional description of the component
 * @argument {function} cb callback to perform after success
 */
module.exports = (projectRoot, type, machinename, description, cb = () => null) => {
  const output = (type !== 'global')
  console.log(consoleColors.fronthack, 'Fetching data from a Fronthack Bit scope...')
  shell.exec(`yarn add @bit/frontcraft.fronthack.${type}s.${machinename}`, {async: true, silent: true}, (code) => {
    if (code !== 0) {
      console.log(consoleColors.fronthack, `There is no ready Fronthack ${type} with the name of ${machinename}.`)
      if (output) {
        console.log(consoleColors.fronthack, 'Generating a new blank one...')
        generateSassComponent(projectRoot, type, machinename, description)
      }
    } else {
      // Copy style.sass to src/sass/${components or layout} or whole dir if type === 'global'
      if (type === 'global') {
        // Exceptional behavior - if component is named style, rename it to base
        const legitMachinename = (machinename === 'style') ? 'base' : machinename
        ncp(`${projectRoot}/node_modules/@bit/frontcraft.fronthack.${type}s.${machinename}`, `${projectRoot}/src/sass/${legitMachinename}`, (err) => {
          if (err) throw err
          // Remove npm package garbage.
          fs.remove(`${projectRoot}/src/sass/${legitMachinename}/.bit_env_has_installed`, (err) => {
            if (err) throw err
            fs.remove(`${projectRoot}/src/sass/${legitMachinename}/bit.json`, (err) => {
              if (err) throw err
              fs.remove(`${projectRoot}/src/sass/${legitMachinename}/package.json`, (err) => {
                if (err) throw err
                removeInstance(type, machinename, output, cb)
              })
            })
          })
        })
      } else {
        fs.readFile(`${projectRoot}/node_modules/@bit/frontcraft.fronthack.${type}s.${machinename}/style.sass`, 'utf8', (err, content) => {
          if (err) throw err
          const parsedContent = content
            // Remove imports unnecessary for static version
            .replace(/^.*@import.*\n+/gm, '')
            // Exceptional behavior that fixes icon font path.
            .replace('./fonts/waat-icons', '../fonts/waat-icons')
          fs.writeFile(`${projectRoot}/src/sass/${type}s/_${machinename}.sass`, parsedContent, (err) => {
            if (err) throw err
            // Read static.html and display it on the screen
            fs.readFile(`${projectRoot}/node_modules/@bit/frontcraft.fronthack.${type}s.${machinename}/static.html`, 'utf8', (err, content) => {
              console.log(consoleColors.fronthack, '\n------------------------------------------------------------\n')
              console.log(highlight(content, { language: 'html' }))
              console.log(consoleColors.fronthack, '\n------------------------------------------------------------\n')
              if (err) throw err
              // Exceptional behavior for font assets.
              const fontsDir = `${projectRoot}/node_modules/@bit/frontcraft.fronthack.${type}s.${machinename}/fonts`
              fs.readdir(fontsDir, (err) => {
                if (err) {
                  addImportToApp(projectRoot, type, machinename, () => {
                    removeInstance(type, machinename, output, cb)
                  })
                } else {
                  console.log(consoleColors.fronthack, 'Found font assets.')
                  ncp(fontsDir, `${projectRoot}/src/fonts`, (err) => {
                    if (err) throw err
                    addImportToApp(projectRoot, type, machinename, () => {
                      removeInstance(type, machinename, output, cb)
                    })
                  })
                }
              })
            })
          })
        })
      }
    }
  })
}

/**
 * Remove installed instance of that component
 * @argument {string} type
 * @argument {string} machinename
 * @argument {boolean} output display console message or not
 * @argument {function} cb
 */
const removeInstance = (type, machinename, output, cb) => {
  shell.exec(`yarn remove @bit/frontcraft.fronthack.${type}s.${machinename}`, {async: true, silent: true}, (code) => {
    if (code !== 0) throw new Error('Could not remove cached Bit component')
    if (output) console.log(consoleColors.fronthack, `Found Fronthack ${type} of given name and imported its code.`)
    cb()
  })
}