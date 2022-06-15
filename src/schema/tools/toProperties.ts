import {CollectionSchemaSuper} from "../types";
import {
  CollectionProperties,
  CollectionTokenPropertyPermissions,
  TokenPropertyPermissionObject
} from "../../substrate/extrinsics/unique/types";
import {converters} from "../schemaUtils";
import {getKeys} from "../../tsUtils";
import {validateCollectionTokenPropertyPermissions} from "./validators";

export const collectionSchemaToProperties = (schema: CollectionSchemaSuper): CollectionProperties => {
  return converters.objectToProperties(schema)
}

const generateDefaultTPPObjectForKey = (key: string): TokenPropertyPermissionObject => ({
  key,
  permission: {mutable: false, collectionAdmin: true, tokenOwner: false}
})

export interface ICollectionSchemaToTokenPropertyPermissionsOptions {
  overwriteTPPs?: CollectionTokenPropertyPermissions
}

export const collectionSchemaToTokenPropertyPermissions = (schema: CollectionSchemaSuper, options?: ICollectionSchemaToTokenPropertyPermissionsOptions): CollectionTokenPropertyPermissions => {
  const permissions: CollectionTokenPropertyPermissions = [
    generateDefaultTPPObjectForKey('n'), // name
    generateDefaultTPPObjectForKey('d'), // description
    generateDefaultTPPObjectForKey('i'), // image url infix
    generateDefaultTPPObjectForKey('iu'),// image url
    generateDefaultTPPObjectForKey('ih'),// image hash
    generateDefaultTPPObjectForKey('p'), // preview image url infix
    generateDefaultTPPObjectForKey('pu'),// preview image url
    generateDefaultTPPObjectForKey('ph'),// preview image hash
    ...getKeys(schema.attributes).map(key => generateDefaultTPPObjectForKey(`a.${key}`))
  ]

  if (schema.hasOwnProperty('video')) {
    permissions.push(generateDefaultTPPObjectForKey('v'))  // video url infix
    permissions.push(generateDefaultTPPObjectForKey('vu')) // video url
    permissions.push(generateDefaultTPPObjectForKey('vh')) // video hash
  }

  if (schema.hasOwnProperty('audio')) {
    permissions.push(generateDefaultTPPObjectForKey('au'))  // audio url infix
    permissions.push(generateDefaultTPPObjectForKey('aui')) // audio url
    permissions.push(generateDefaultTPPObjectForKey('auh')) // audio hash
  }

  if (schema.hasOwnProperty('object3D')) {
    permissions.push(generateDefaultTPPObjectForKey('3d'))  // 3DObject url infix
    permissions.push(generateDefaultTPPObjectForKey('3du')) // 3DObject url
    permissions.push(generateDefaultTPPObjectForKey('3dh')) // 3DObject hash
  }

  if (options?.overwriteTPPs) {
    const {overwriteTPPs} = options

    if (!validateCollectionTokenPropertyPermissions(overwriteTPPs)) {
      throw new Error(`overwriteTPPs are not valid`)
    }

    for (const tpp of overwriteTPPs) {
      const index = permissions.findIndex(permission => permission.key === tpp.key)
      if (index < 0) {
        permissions.push(tpp)
      } else {
        permissions[index] = tpp
      }
    }
  }

  return permissions
}
