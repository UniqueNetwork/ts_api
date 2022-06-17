import {CollectionSchemaUnique} from "../types";
import {
  CollectionProperties,
  CollectionTokenPropertyPermissions,
  TokenPropertyPermissionObject
} from "../../substrate/extrinsics/unique/types";
import {converters2Layers} from "../schemaUtils";
import {getKeys} from "../../tsUtils";
import {validateCollectionTokenPropertyPermissions} from "./validators";

export const packCollectionSchemaToProperties = (schema: CollectionSchemaUnique): CollectionProperties => {
  return converters2Layers.objectToProperties(schema)
}

export const unpackCollectionSchemaFromProperties = <T extends CollectionSchemaUnique>(properties: CollectionProperties): any => {
  return converters2Layers.propertiesToObject(properties) as any
}


const generateDefaultTPPObjectForKey = (key: string): TokenPropertyPermissionObject => ({
  key,
  permission: {mutable: false, collectionAdmin: true, tokenOwner: false}
})

export interface ICollectionSchemaToTokenPropertyPermissionsOptions {
  overwriteTPPs?: CollectionTokenPropertyPermissions
}
export const generateTokenPropertyPermissionsFromCollectionSchema = (schema: CollectionSchemaUnique, options?: ICollectionSchemaToTokenPropertyPermissionsOptions): CollectionTokenPropertyPermissions => {
  const permissions: CollectionTokenPropertyPermissions = [
    generateDefaultTPPObjectForKey('n'), // name
    generateDefaultTPPObjectForKey('d'), // description
    generateDefaultTPPObjectForKey('i'), // image url infix
    generateDefaultTPPObjectForKey('iu'),// image url
    generateDefaultTPPObjectForKey('ih'),// image hash
    generateDefaultTPPObjectForKey('p'), // preview image url infix
    generateDefaultTPPObjectForKey('pu'),// preview image url
    generateDefaultTPPObjectForKey('ph'),// preview image hash
    ...getKeys(schema.attributesSchema).map(key => generateDefaultTPPObjectForKey(`a.${key}`))
  ]

  if (schema.hasOwnProperty('video')) {
    permissions.push(generateDefaultTPPObjectForKey('v'))  // video url infix
    permissions.push(generateDefaultTPPObjectForKey('vu')) // video url
    permissions.push(generateDefaultTPPObjectForKey('vh')) // video hash
  }

  if (schema.hasOwnProperty('audio')) {
    permissions.push(generateDefaultTPPObjectForKey('au'))  // audio url infix
    permissions.push(generateDefaultTPPObjectForKey('auu')) // audio url
    permissions.push(generateDefaultTPPObjectForKey('auh')) // audio hash
  }

  if (schema.hasOwnProperty('spatialObject')) {
    permissions.push(generateDefaultTPPObjectForKey('so'))  // spatialObject url infix
    permissions.push(generateDefaultTPPObjectForKey('sou')) // spatialObject url
    permissions.push(generateDefaultTPPObjectForKey('soh')) // spatialObject hash
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
