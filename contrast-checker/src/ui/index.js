import '@spectrum-web-components/styles/typography.css'

import '@spectrum-web-components/theme/src/themes.js'
import '@spectrum-web-components/theme/theme-light.js'
import '@spectrum-web-components/theme/express/theme-light.js'
import '@spectrum-web-components/theme/express/scale-medium.js'
import '@spectrum-web-components/theme/sp-theme.js'

import '@spectrum-web-components/button/sp-button.js'
import '@spectrum-web-components/field-label/sp-field-label.js'
import '@spectrum-web-components/textfield/sp-textfield.js'
import '@spectrum-web-components/swatch/sp-swatch.js'
import '@spectrum-web-components/help-text/sp-help-text.js'
import '@spectrum-web-components/icons-workflow/icons/sp-icon-help-outline.js'
import '@spectrum-web-components/icons-workflow/icons/sp-icon-checkmark-circle-outline.js'
import '@spectrum-web-components/icons-workflow/icons/sp-icon-cancel.js'
import '@spectrum-web-components/icons-workflow/icons/sp-icon-graph-trend.js'
import '@spectrum-web-components/icons-workflow/icons/sp-icon-graph-pie.js'
import '@spectrum-web-components/icons-workflow/icons/sp-icon-graph-bar-vertical'
import '@spectrum-web-components/link/sp-link.js'
import '@spectrum-web-components/accordion/sp-accordion.js'
import '@spectrum-web-components/accordion/sp-accordion-item.js'

import colorContrast from 'color-contrast'

import addOnUISdk from 'https://new.express.adobe.com/static/add-on-sdk/sdk.js'

// Checks whether hexCode is a valid hex code
function isValidHexCode (hexCode) {
  const hexRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/
  return hexRegex.test(hexCode)
}

// Ensure user input always starts with #
function formatHexInput (userInput) {
  // Check if the input starts with #
  if (!userInput.startsWith('#')) {
    // Add # to the beginning of the input
    userInput = '#' + userInput
    return userInput
  }
  return userInput
}

// Handle shorthand notation so that the color picker value is valid
function getFullHexCode (hexCode) {
  // Remove leading #
  hexCode = hexCode.replace(/^#/, '')
  if (hexCode.length === 3) {
    hexCode =
      hexCode[0] +
      hexCode[0] +
      hexCode[1] +
      hexCode[1] +
      hexCode[2] +
      hexCode[2]
  }
  return '#' + hexCode
}

// Takes two hex codes and returns the contrast between the two colors
function computeContrast (foregroundColor, backgroundColor) {
  const contrastRatio = colorContrast(foregroundColor, backgroundColor)
  console.log(
    'Contrast between ' +
      foregroundColor +
      ' and ' +
      backgroundColor +
      ': ' +
      contrastRatio
  )
  return contrastRatio
}

// Format HTML to display correct icon and text depending on whether a certain contrast rule is met or fails
function getContrastDisplay (
  computedContrast,
  contrastRequirement,
  parentContainer
) {
  parentContainer.innerHTML = '' // clear any child results
  if (computedContrast < contrastRequirement) {
    // Failed
    var resultIcon = document.createElement('sp-icon-cancel')
    var resultText = document.createElement('span')
    resultText.textContent = 'Fail'
    parentContainer.appendChild(resultIcon)
    parentContainer.appendChild(resultText)
  } else {
    var resultIcon = document.createElement('sp-icon-checkmark-circle-outline')
    var resultText = document.createElement('span')
    resultText.textContent = 'Pass'
    parentContainer.appendChild(resultIcon)
    parentContainer.appendChild(resultText)
  }
}

function getContrastResults (foregroundColor, backgroundColor) {
  const contrastRatio = computeContrast(foregroundColor, backgroundColor)
  const contrastOutput = document.getElementById('contrastRatio')
  contrastOutput.textContent = parseFloat(contrastRatio.toFixed(2)) + ': 1'

  // AA Regular Text test
  const aaRegularResult = document.getElementById('aaRegular')
  getContrastDisplay(contrastRatio, 4.5, aaRegularResult) // passes AA Regular Text if contrast ratio is 4.5:1 or greater

  // AA Large Text test
  const aaLargeResult = document.getElementById('aaLarge')
  getContrastDisplay(contrastRatio, 3, aaLargeResult) // passes AA Large Text if contrast ratio is 3:1 or greater

  // AAA Regular Text test
  const aaaRegularResult = document.getElementById('aaaRegular')
  getContrastDisplay(contrastRatio, 7, aaaRegularResult) // passes AAA Regular Text if contrast ratio is 7:1 or greater

  // AAA Large Text test
  const aaaLargeResult = document.getElementById('aaaLarge')
  getContrastDisplay(contrastRatio, 4.5, aaaLargeResult) // passes AAA Large Text if contrast ratio is 4.5:1 or greater

  // AA Graphical Objects test
  const aaGraphical = document.getElementById('aaGraphical')
  getContrastDisplay(contrastRatio, 3, aaGraphical) // passes AA Graphical Objects if contrast ratio is 3:1 or greater

  // AAA Graphical Objects test
  const aaaGraphical = document.getElementById('aaaGraphical')
  getContrastDisplay(contrastRatio, 3, aaaGraphical) // no AAA Graphical Objects standard, so if it passes AA Graphical Objects (contrast ratio is 3:1 or greater) then it passes
}

// Update colors shown in the preview
function updateColorPreview (foregroundColor, backgroundColor) {
  // Update color of foreground elements in preview
  // Get all paragraphs within the preview div container
  var text = document.querySelectorAll('#colorPreview p')

  // Set the text color for each paragraph
  text.forEach(function (text) {
    text.style.color = foregroundColor
  })

  // Get all icons within the preview div container
  var icons = document.querySelectorAll('#colorPreview .graphical-icon')

  // Set the text color for each paragraph
  icons.forEach(function (icon) {
    icon.style.color = foregroundColor
  })

  // Update background color in preview
  // Get the container element
  var previewContainer = document.getElementById('colorPreview')

  // Set the background color for the preview div container
  previewContainer.style.backgroundColor = backgroundColor
}

// Add the message to the container for an error
function addErrorMessage (container, message) {
  if (container.childElementCount === 0) {
    // Create a new help text element
    var helpText = document.createElement('sp-help-text')

    // Set text content
    helpText.textContent = message

    // Set attributes
    helpText.id = container + 'Text'
    helpText.variant = 'negative'
    helpText.setAttribute('icon', true)

    // Append the new help text to the parent container
    container.appendChild(helpText)
  }
}

// Remove the error messag from the parent container
function removeErrorMessage (parentContainer) {
  // Remove all nested child elements by resetting innerHTML
  parentContainer.innerHTML = ''
  console.log('Removing from ' + parentContainer)
}

addOnUISdk.ready.then(async () => {
  console.log('addOnUISdk is ready for use.')

  // Input fields -------------------------------------------

  const foregroundInput = document.getElementById('foreground')
  const backgroundInput = document.getElementById('background')

  foregroundInput.value = '#00087a' // starting foreground color value
  backgroundInput.value = '#c7e3ea' // starting background color value

  // Color pickers ------------------------------------------

  const foregroundColorPicker = document.getElementById('foregroundColorPicker')
  const foregroundColorSwatch = document.getElementById('foregroundColorSwatch')
  const backgroundColorPicker = document.getElementById('backgroundColorPicker')
  const backgroundColorSwatch = document.getElementById('backgroundColorSwatch')

  const backgroundErrorMessage = document.getElementById(
    'backgroundErrorMessage'
  )

  const foregroundErrorMessage = document.getElementById(
    'foregroundErrorMessage'
  )

  // Initialize color picker and swatch values and update the starting color preview and contrast results accordingly
  foregroundColorPicker.value = '#00087a'
  foregroundColorSwatch.color = '#00087a'
  backgroundColorPicker.value = '#c7e3ea'
  backgroundColorSwatch.color = '#c7e3ea'
  updateColorPreview(foregroundInput.value, backgroundInput.value)
  getContrastResults(foregroundInput.value, backgroundInput.value)

  foregroundColorSwatch.addEventListener('click', function (event) {
    foregroundColorPicker.click()
    foregroundColorSwatch.setAttribute('selected', true) // show foreground color swatch as selected
  })

  // Update foreground color swatch value and compute contrast when the foreground color picker changes
  foregroundColorPicker.addEventListener('input', function (event) {
    const selectedColor = event.target.value
    foregroundColorSwatch.setAttribute('color', selectedColor)
    foregroundInput.value = selectedColor // set hex code in input field
    removeErrorMessage(foregroundErrorMessage) // clear error message
    updateColorPreview(foregroundInput.value, backgroundInput.value)
    getContrastResults(foregroundInput.value, backgroundInput.value)
  })

  backgroundColorSwatch.addEventListener('click', function (event) {
    backgroundColorPicker.click()
    backgroundColorSwatch.setAttribute('selected', true) // show background color swatch as selected
  })

  // If applicable, remove selected state from color swatches if elements outside of the color swatches are clicked
  document.addEventListener('click', function (event) {
    if (!foregroundColorSwatch.contains(event.target)) {
      // The foreground color swatch should not have a visually selected state if the click originates outside of the foreground color swatch
      if (foregroundColorSwatch.hasAttribute('selected')) {
        foregroundColorSwatch.removeAttribute('selected')
      }
    }
    if (!backgroundColorSwatch.contains(event.target)) {
      // The background color swatch should not have a visually selected state if the click originates outside of the foreground color swatch
      if (backgroundColorSwatch.hasAttribute('selected')) {
        backgroundColorSwatch.removeAttribute('selected')
      }
    }
  })

  // Update background color swatch value and compute contrast when the background color picker changes
  backgroundColorPicker.addEventListener('input', function (event) {
    const selectedColor = event.target.value
    backgroundColorSwatch.setAttribute('color', selectedColor)
    backgroundInput.value = selectedColor // set hex code in input field
    removeErrorMessage(backgroundErrorMessage) // clear error message
    updateColorPreview(foregroundInput.value, backgroundInput.value)
    getContrastResults(foregroundInput.value, backgroundInput.value)
  })

  // Update background color swatch and picker values when the background color input field changes and is a valid hex code, compute contrast
  backgroundInput.addEventListener('input', function (event) {
    const inputtedHexCode = event.target.value
    const formattedHexCode = formatHexInput(inputtedHexCode)
    event.target.value = formattedHexCode
    if (isValidHexCode(formattedHexCode)) {
      removeErrorMessage(backgroundErrorMessage)
      const fullHexCode = getFullHexCode(formattedHexCode) // get formatted six character hex code with leading #, address any shorthand notation
      backgroundColorSwatch.setAttribute('color', fullHexCode)
      backgroundColorPicker.value = fullHexCode
      updateColorPreview(foregroundInput.value, backgroundInput.value)
      getContrastResults(foregroundInput.value, backgroundInput.value)
    } else {
      addErrorMessage(backgroundErrorMessage, 'Please input a valid hex code.')
    }
  })

  // Update foreground color swatch and picker values when the foreground color input field changes and is a valid hex code, compute contrast
  foregroundInput.addEventListener('input', function (event) {
    const inputtedHexCode = event.target.value
    const formattedHexCode = formatHexInput(inputtedHexCode)
    event.target.value = formattedHexCode
    if (isValidHexCode(formattedHexCode)) {
      removeErrorMessage(foregroundErrorMessage)
      const fullHexCode = getFullHexCode(formattedHexCode) // get formatted six character hex code with leading #, address any shorthand notation
      foregroundColorSwatch.setAttribute('color', fullHexCode)
      foregroundColorPicker.value = fullHexCode
      updateColorPreview(foregroundInput.value, backgroundInput.value)
      getContrastResults(foregroundInput.value, backgroundInput.value)
    } else {
      addErrorMessage(foregroundErrorMessage, 'Please input a valid hex code.')
    }
  })
})
