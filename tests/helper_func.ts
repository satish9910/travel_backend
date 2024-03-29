import assert from 'node:assert'
import helper from '../utils/helpers'
import test, { describe, it } from 'node:test'

describe('isValidPayload tests', async () => {
    await test('should return false if body is empty', () => {
        const body = {}
        const fields = ['name', 'email', 'password']
        assert.strictEqual(helper.isValidatePaylod(body, fields), false)
    })
    await test('should return true when found all fields in body', () => {
        const body = { name: 'kapil', email: 'helo@gmail.com', password: 'something' }
        const fields = ['name', 'email', 'password']
        assert.strictEqual(helper.isValidatePaylod(body, fields), true)
    })
})

describe('isValidDateFormat tests', () => {
    it('should return false if date is not in yyyy-mm-dd format', () => {
        const invalidDate1 = '2021-12'
        const invalidDate2 = '021-12-32'
        const invalidDate3 = '12-12-2020'
        assert.strictEqual(helper.isValidDateFormat(invalidDate1), false)
        assert.strictEqual(helper.isValidDateFormat(invalidDate2), false)
        assert.strictEqual(helper.isValidDateFormat(invalidDate3), false)
    })
    it('should return true if date is in yyyy-mm-dd format', () => {
        const validDate = '2021-12-12'
        assert.strictEqual(helper.isValidDateFormat(validDate), true)
    })
})
