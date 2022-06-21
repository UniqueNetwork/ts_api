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

const generateDefaultTPPsForInfixOrUrlOrCidAndHashObject = (permissions: CollectionTokenPropertyPermissions, prefix: string) => {
  permissions.push(generateDefaultTPPObjectForKey(`${prefix}.i`)) // url infix
  permissions.push(generateDefaultTPPObjectForKey(`${prefix}.c`)) // ipfs cid
  permissions.push(generateDefaultTPPObjectForKey(`${prefix}.u`)) // url
  permissions.push(generateDefaultTPPObjectForKey(`${prefix}.h`)) // hash
}

export interface ICollectionSchemaToTokenPropertyPermissionsOptions {
  overwriteTPPs?: CollectionTokenPropertyPermissions
}
export const generateTokenPropertyPermissionsFromCollectionSchema = (schema: CollectionSchemaUnique, options?: ICollectionSchemaToTokenPropertyPermissionsOptions): CollectionTokenPropertyPermissions => {
  const permissions: CollectionTokenPropertyPermissions = [
    generateDefaultTPPObjectForKey('n'), // name
    generateDefaultTPPObjectForKey('d'), // description
  ]

  generateDefaultTPPsForInfixOrUrlOrCidAndHashObject(permissions, 'i')     // image url, urlInfix, ipfsCid and hash (i.u, i.i, i.c, i.h)

  if (schema.hasOwnProperty('imagePreview')) {
    generateDefaultTPPsForInfixOrUrlOrCidAndHashObject(permissions, 'p')    // imagePreview url, urlInfix, ipfsCid and hash (p.u, p.i, p.c, p.h)
  }

  if (schema.hasOwnProperty('video')) {
    generateDefaultTPPsForInfixOrUrlOrCidAndHashObject(permissions, 'v')    // video url, urlInfix, ipfsCid and hash (v.u, v.i, v.c, v.h)
  }

  if (schema.hasOwnProperty('audio')) {
    generateDefaultTPPsForInfixOrUrlOrCidAndHashObject(permissions, 'au')   // audio url, urlInfix, ipfsCid and hash (au.u, au.i, au.c, au.h)
  }

  if (schema.hasOwnProperty('spatialObject')) {
    generateDefaultTPPsForInfixOrUrlOrCidAndHashObject(permissions, 'so')   // spatialObject url, urlInfix, ipfsCid and hash (so.u, so.i, so.c, so.h)
  }

  if (schema.attributesSchema) {
    getKeys(schema.attributesSchema).forEach(key => generateDefaultTPPObjectForKey(`a.${key}`))
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
