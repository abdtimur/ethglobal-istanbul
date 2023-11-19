import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address } from "@graphprotocol/graph-ts"
import { CollectionCreated } from "../generated/schema"
import { CollectionCreated as CollectionCreatedEvent } from "../generated/MindShare/MindShare"
import { handleCollectionCreated } from "../src/mind-share"
import { createCollectionCreatedEvent } from "./mind-share-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let mentor = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let collection = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newCollectionCreatedEvent = createCollectionCreatedEvent(
      mentor,
      collection
    )
    handleCollectionCreated(newCollectionCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("CollectionCreated created and stored", () => {
    assert.entityCount("CollectionCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "CollectionCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "mentor",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "CollectionCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "collection",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
