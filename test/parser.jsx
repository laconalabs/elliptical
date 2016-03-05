/* eslint-env mocha */

import element from '../src/element'
import createParser from '../src/create-parser'
import Observable from 'zen-observable'
import chai, {expect} from 'chai'
import {spy} from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('parser', () => {
  it('returns parse and store', () => {
    const parser = createParser(<literal text='test' />)

    expect(parser.store).to.be.an.instanceof(Object)
    expect(parser.store.subscribe).to.be.an.instanceof(Function)
    expect(parser.store.register).to.be.an.instanceof(Function)
    expect(parser.parse).to.be.an.instanceof(Function)

    const outputs = parser.parse('t')
    expect(outputs).to.eql([{
      text: null,
      words: [{text: 't', input: true}, {text: 'est', input: false}],
      result: undefined,
      score: 1,
      qualifiers: []
    }])
  })
  it('allows for sources and automatically rereconciles', (done) => {
    function Source () {
      return new Observable(observer => {
        observer.next('test')
        process.nextTick(() => {
          observer.next('totally')
        })
      })
    }

    const Test = {
      observe() {
        return <Source />
      },
      describe({data}) {
        return <literal text={data} />
      }
    }
    const {parse} = createParser(<Test />)
    
    const outputs = parse('t')
    expect(outputs).to.eql([{
      text: null,
      words: [{text: 't', input: true}, {text: 'est', input: false}],
      result: undefined,
      score: 1,
      qualifiers: []
    }])

    process.nextTick(() => {
      const outputs = parse('t')
      expect(outputs).to.eql([{
        text: null,
        words: [{text: 't', input: true}, {text: 'otally', input: false}],
        result: undefined,
        score: 1,
        qualifiers: []
      }])
      done()
    })
  })
})
