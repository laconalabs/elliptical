import _ from 'lodash'

export default function *parse({phrase, input, options}) {
  yield* parseElement({phrase, input, options})
}

function *parseElement({phrase, input, options}) {
  if (phrase.__describedPhrase) {
    const iterator = parse({phrase: phrase.__describedPhrase, input, options})
    for (let output of iterator) {
      let result, getValue

      if (phrase.__oldExtensions.length) {
        const key = _.keys(output.result)[0]
        let child
        if (key === '0') { // this is because extensions are mapped as a choice
          child = phrase
        } else {
          child = phrase.__describedPhrase.childPhrases[key]
        }
        result = output.result[key]
        if (child && child.getValue) {
          getValue = child.getValue.bind(child)
        }
      } else {
        result = output.result
        if (phrase.getValue) {
          getValue = phrase.getValue.bind(phrase)
        }
      }

      if (!phrase.filter || phrase.filter(result)) {
        const trueResult = getValue ? getValue(result) : result
        const newOutput = _.assign({}, output, {result: trueResult})

        yield newOutput
      }
    }
  } else if (phrase._handleParse) {
    yield* phrase._handleParse(input, options, parse)
  } else {
    //noop
  }

  _.forEach(phrase.__sources, obj => {
    obj.lastVersion = obj.source.__dataVersion
  })
}
