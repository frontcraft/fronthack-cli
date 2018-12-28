'use strict'

const prompt = require('prompt')
const shell = require('shelljs')
const fs = require('fs-extra')
const getFronthackPath = require('../helpers/getFronthackPath')
const consoleColors = require('../helpers/consoleColors')
const fetchComponent = require('../helpers/fetchComponent')
const regex = require('../helpers/regex')


module.exports = () => {
  const initSchema = {
    properties: {
      name: {
        description: 'Directory of installation',
        type: 'string',
        pattern: regex.projectName,
        message: 'Name must be only letters, numbers dashes or underscores',
        default: 'fronthack-react'
      }
    }
  }
  prompt.start()
  prompt.get(initSchema, (err, result) => {
    console.log(consoleColors.fronthack, 'Creating React app with Fronthack utilities...')
    console.log(consoleColors.fronthack, 'This command is a wrapper of the "Create React App" project.')
    console.log('')
    console.log(consoleColors.fronthack, 'Fronhack philosophy is to generate and hack - automate boilerplate, expose everything for developer, leave nothing under the hood.')
    console.log('')
    // Create React app.
    shell.exec(`npx create-react-app ${result.name}`, { async: true }, (code) => {
      if (code != 0) throw new Error('Error: Creating React app failed')
      shell.cd(result.name)
      const currentPath = process.cwd()
      // Install additional dependencies.
      shell.exec('yarn add copy-webpack-plugin node-sass bem-modifiers', { async: true, silent: true }, (code) => {
        if (code != 0) throw new Error('Error: Adding node dependencies failed')
        shell.exec('yarn add --dev fronthack-scripts eslint babel-eslint eslint-config-standard eslint-config-standard-react eslint-plugin-node eslint-plugin-promise eslint-plugin-standard', { async: true, silent: true }, (code) => {
          if (code != 0) throw new Error('Error: Adding dev dependencies failed')
          shell.exec('git add . && git commit -m "Added fronthack dependencies"', {async: true, silent: true}, (code) => {
            // Eject webpack config.
            shell.exec('echo y | yarn eject', { async: true }, (code) => {
              if (code != 0) throw new Error('Error: Could not use yarn');
              getFronthackPath(fronthackPath => {
                // Apply changes in App.js file.
                fs.readFile(`${currentPath}/src/App.js`, 'utf8', (err, content) => {
                  if (err) throw err
                  const newContent = content.replace('./App.css', './style/index.sass')
                  fs.writeFile(`${currentPath}/src/App.js`, newContent, (err) => {
                    if (err) throw err
                    // Perform changes in index.js file.
                    fs.readFile(`${fronthackPath}/templates/fronthack-scripts-import.js`, 'utf8', (err, scriptsImportTemplate) => {
                      if (err) throw err
                      fs.readFile(`${currentPath}/src/index.js`, 'utf8', (err, content) => {
                        if (err) throw err
                        const newContent = content
                          .replace("import './index.css';\n", '')
                          .concat(scriptsImportTemplate)
                        fs.writeFile(`${currentPath}/src/index.js`, newContent, (err) => {
                          if (err) throw err
                          // Add eslint config.
                          fs.readFile(`${fronthackPath}/templates/.eslintrc`, 'utf8', (err, content) => {
                            if (err) throw err
                            fs.writeFile(`${currentPath}/.eslintrc`, content, (err) => {
                              if (err) throw err
                              // Remove files that are not used anymore.
                              fs.unlink(`${currentPath}/src/index.css`, (err) => {
                                if (err) throw err
                                fs.unlink(`${currentPath}/src/App.css`, (err) => {
                                  if (err) throw err
                                  // Inject Fronthack development tools to a Webpack config.
                                  fs.readFile(`${fronthackPath}/templates/webpack.config.fronthack-scripts.js`, 'utf8', (err, WebpackFronthackScripts) => {
                                    if (err) throw err
                                    fs.readFile(`${currentPath}/config/webpack.config.js`, 'utf8', (err, webpackConfContent) => {
                                      if (err) throw err
                                      const newContent = webpackConfContent
                                        .replace("require('webpack');", "require('webpack');\nconst CopyWebpackPlugin = require('copy-webpack-plugin');")
                                        .replace('WatchMissingNodeModulesPlugin(paths.appNodeModules),', `WatchMissingNodeModulesPlugin(paths.appNodeModules),\n${WebpackFronthackScripts}`)
                                      fs.writeFile(`${currentPath}/config/webpack.config.js`, newContent, (err) => {
                                        if (err) throw err
                                        // Prepare designs directory.
                                        fs.ensureDir(`${currentPath}/designs`, (err) => {
                                          if (err) throw err
                                          fs.readFile(`${fronthackPath}/templates/designs-readme.md`, 'utf8', (err, content) => {
                                            if (err) throw err
                                            fs.writeFile(`${currentPath}/designs/README.md`, content, (err) => {
                                              if (err) throw err
                                              fetchComponent(currentPath, true, false, 'style', null, (err) => {
                                                if (err) throw err
                                                // Do initial git commit.
                                                shell.exec('git add .', {async: true, silent: true}, (code) => {
                                                  // if (code != 0) throw new Error('Error: Could not use git');
                                                  shell.exec('git commit -m "Added fronthack stuff"', {async: true, silent: true}, (code) => {
                                                    // if (code != 0) throw new Error('Error: Could not use git');
                                                    console.log(consoleColors.fronthack, 'Opinionated Fronthack React project is ready for hacking! Begin by typing:')
                                                    console.log('')
                                                    console.log(consoleColors.fronthack, `  cd ${result.name}`)
                                                    console.log(consoleColors.fronthack, '  yarn start')
                                                    console.log('')
                                                  })
                                                })
                                              })
                                            })
                                          })
                                        })
                                      })
                                    })
                                  })
                                })
                              })
                            })
                          })
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })
}