const moment = require('moment')
const faker = require('faker')

const {
  models: { Team, Page, User, Revision, PageOwner },
} = require('../utils')

const createTeam = (...users) => {
  const t = new Team({
    handle: faker.internet.userName(),
    users,
  })
  return t.save()
}
const createPage = user => {
  const p = new Page({
    path: faker.system.fileName(),
    grant: Page.GRANT_PUBLIC,
    grantedUsers: [user._id],
    creator: user._id,
  })
  return p.save()
}
const createUser = () => {
  const r = faker.internet.userName()
  const u = new User({
    name: r,
    username: r,
    email: r + '@example.com',
  })
  return u.save()
}

describe('Revision', () => {
  describe('#prepareRevision', () => {
    describe('Check setting expireAt', () => {
      let user, team

      beforeAll(async () => {
        user = await createUser()
        team = await createTeam(user)
      })

      test('empty', async () => {
        const page = await createPage(user)
        const revision = Revision.prepareRevision(page, '# body', user, {})
        expect(revision.expireAt).toBe(null)
      })

      test('when expireAt configuration found', async () => {
        let page = await createPage(user)

        await PageOwner.activate({ team, page })
        page = await page.populate('owners').execPopulate()

        const expireAt = moment()
          .add({ days: 100 })
          .endOf('day')
          .toDate()
        const revision = Revision.prepareRevision(page, '# body', user, { expireAt })

        expect(revision.expireAt).toBe(expireAt)
      })
    })
  })
})