/* eslint-env mocha */

import literal from '../src/elements/literal'
import element from '../src/element'
import reconcile from '../src/reconcile'
import chai, {expect} from 'chai'
import {spy} from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('reconcile', () => {
  it('returns a function', () => {
    const Test = {parse() {}}
    const reconciled = reconcile(<Test />)
    
    expect(reconciled).to.be.an.instanceof(Function)
  })

  it('is fine with describe returning nothing', () => {
    const Test = {describe() {}}
    const reconciled = reconcile(<Test />)
    
    expect(reconciled).to.be.an.instanceof(Function)
  })


  it('passes props to describe', () => {
    const Test = {
      describe({props, children}) {
        expect(props).to.eql({something: 'test'})
        expect(children).to.eql([])
      }
    }
    const reconciled = reconcile(<Test something='test' />)
  })

  it('calls register with the results of observe', () => {
    const Test = {
      observe () {
        return 3
      }
    }
    const register = spy()
    const reconciled = reconcile(<Test />, register)

    expect(register).to.have.been.calledWith(3)
  })

  it('passes props to observe', () => {
    const Test = {
      observe ({props, children}) {
        expect(props).to.eql({num: 3})
        expect(children).to.eql([])
        return props.num + 3
      }
    }
    const register = spy()
    const reconciled = reconcile(<Test num={3} />, register)

    expect(register).to.have.been.calledWith(6)
  })

  it('passes result of register to describe as data', () => {
    const Test = {}
    const Root = {
      observe () {
        return 3
      },
      describe ({data}) {
        expect(data).to.eql(6)
        return <Test test={data} />
      }
    }

    const register = spy(num => num + 3)

    reconcile(<Root />, register)

    expect(register).to.have.been.calledWith(3)
  })

  it('flattens children', () => {
    const describeSpy = spy()

    const Test = {
      describe ({children}) {
        expect(children).to.eql([
          {type: literal, attributes: {text: 'a'}, children: []},
          {type: literal, attributes: {text: 'b'}, children: []}
        ])
        describeSpy()
        return children[0]
      }
    }

    reconcile(<Test>{[<literal text='a' />, [<literal text='b' />]]}</Test>)
    expect(describeSpy).to.have.been.calledOnce
  })
})
